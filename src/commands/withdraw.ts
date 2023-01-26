import { Command, Flags } from "@oclif/core"
import dateFormat from "dateformat"
import { Account } from "web3-core"
import { activateAndVote, withdrawStCelo } from "../helpers/backend-helper"
import {
  getAccountContractTransactions,
  getAccountEventValues,
  getManagerContract,
  getStCeloContract,
} from "../helpers/contract-helpers"
import {
  addKitAccount,
  checkBalance,
  createAccount,
  createKit,
} from "../helpers/kit-helpers"
import {
  setVariablesBasedOnCurrentNetwork,
} from "../helpers/network-selector"
import { writeFile } from "node:fs/promises"
import { FileContent } from "../interfaces/file-content"

export default class Withdraw extends Command {
  static description = "load test of withdrawal"

  static examples = ["load-test withdraw <primary_key> -c 25"]

  static args = [{ name: "primaryKey", require: true }]

  static flags = {
    count: Flags.string({
      char: "c",
      description: "count of parallel requests",
      default: "10",
    }),
    amount: Flags.string({
      char: "a",
      description: "amount of CELO to transfer to each account",
      default: "0.01",
    }),
    network: Flags.string({
      char: "n",
      description: "CELO network",
      default: "alfajores",
    }),
    gas: Flags.string({
      char: "g",
      description:
        "extra amount of CELO to transfer to each account (to cover gas fees)",
      default: "0.03",
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Withdraw)

    const countOfParallelism = Number.parseInt(flags.count)
    const amountOfCelo = flags.amount
    const network = flags.network
    const gas = Number.parseFloat(flags.gas)

    setVariablesBasedOnCurrentNetwork(network)

    const kit = createKit()
    const primaryAccount = addKitAccount(kit, args.primaryKey)

    this.log(`Network: ${network}`)
    this.log(`Count of parallel requests: ${countOfParallelism}`)
    this.log(`Amount of CELO to be transfered to each account: ${amountOfCelo}`)
    this.log(`Primary account: ${primaryAccount}`)
    this.log(`Extra CELO as gas sent: ${gas}`)

    await checkBalance(
      kit,
      primaryAccount,
      Number.parseFloat(amountOfCelo + gas) * countOfParallelism,
      message => this.log(message),
    )

    const accountPromises: Promise<Account>[] = []

    for (let i = 0; i < countOfParallelism; i++) {
      accountPromises.push(createAccount(kit, message => this.log(message)))
    }

    const accounts = await Promise.all(accountPromises)

    const amountOfCeloWei = kit.connection.web3.utils.toWei(
      amountOfCelo,
      "ether",
    )

    const amountOfCeloWeiWithExtraGas = kit.connection.web3.utils.toWei(
      (Number.parseFloat(amountOfCelo) + gas).toString(),
      "ether",
    )

    const sendCeloTransactionResultPromises = accounts.map(account => {
      this.log(`Sending CELO to ${account.address}`)
      kit.addAccount(account.privateKey)

      return kit.sendTransaction({
        to: account.address,
        value: amountOfCeloWeiWithExtraGas,
        from: primaryAccount,
      })
    })

    const sendCeloTransactionResult = await Promise.all(
      sendCeloTransactionResultPromises,
    )
    await Promise.all(sendCeloTransactionResult.map(transaction => transaction.waitReceipt()))

    const managerContract = getManagerContract(kit)

    const txObject = managerContract.methods.deposit()
    const depositTransactionPromises = accounts.map(account => {
      this.log(`Depositing ${amountOfCelo} CELO to ${account.address} for stCELO`)
      return kit.sendTransactionObject(txObject, {
        from: account.address,
        value: amountOfCeloWei,
      })
    })

    const depositTransactions = await Promise.all(depositTransactionPromises)
    await Promise.all(depositTransactions.map(transaction => transaction.waitReceipt()))

    await activateAndVote(message => this.log(message))

    const recentAccountContractTransactions = await getAccountContractTransactions(kit)
    const wasActivateAndVoteCalled = recentAccountContractTransactions.some(tx => tx?.method === "activateAndVote")

    if (!wasActivateAndVoteCalled) {
      throw new Error("ActivateAndVote was not called")
    }

    const stCeloContract = getStCeloContract(kit)

    const withdrawTransactionPromises = accounts.map(async account => {
      const balanceOfStCelo = await stCeloContract.methods
        .balanceOf(account.address)
        .call()
      const txObjectWithdraw = managerContract.methods.withdraw(balanceOfStCelo)
      this.log(`Withdrawing ${balanceOfStCelo} stCELO to ${account.address} for CELO`)
      return kit.sendTransactionObject(txObjectWithdraw, {
        from: account.address,
      })
    })

    const withdrawTransactions = await Promise.all(withdrawTransactionPromises)
    await Promise.all(withdrawTransactions.map(transaction => transaction.waitReceipt()))

    const withdrawalBackendPromises = accounts.map(account =>
      withdrawStCelo(account.address, message => this.log(message)),
    )

    await Promise.all(withdrawalBackendPromises)

    const now = new Date()
    await writeFile(
      `withdrawals_${dateFormat(now, "yyyymmdd_HHMMss")}.json`,
      JSON.stringify({
        accounts,
        timestamp: now.getTime(),
        network: network,
        amount: amountOfCelo,
        gas: gas,
      } as FileContent),
    )

    // Validate backend withdrawal events
    const logs = await getAccountEventValues(kit, "CeloWithdrawalStarted")

    const allAccountsWithWithdrawalEvent = new Set(logs.map(log => log.beneficiary))
    const accountsWithoutBackendWithdrawalEvent = accounts.filter(account => !allAccountsWithWithdrawalEvent.has(account.address))
    if (accountsWithoutBackendWithdrawalEvent.length > 0) {
      throw new Error(`Following accounts don't have any withdrawal  ${JSON.stringify(accountsWithoutBackendWithdrawalEvent)}`)
    }

    this
      .log("SUCCESS")
  }
}
