import { CeloTxReceipt } from "@celo/connect"
import { Command, Flags } from "@oclif/core"
import { Account } from "web3-core"
import { withdrawStCelo } from "../helpers/backend-helper"
import { getManagerContract } from "../helpers/contract-helpers"
import {
  addKitAccount,
  checkBalance,
  createAccount,
  createKit,
} from "../helpers/kit-helpers"
import { setVariablesBasedOnCurrentNetwork } from "../helpers/network-selector"
import { writeFile } from "node:fs/promises"
import { formatDate } from "../helpers/datetime-helper"

export default class Withdraw extends Command {
  static description = "describe the command here"

  static examples = ["<%= config.bin %> <%= command.id %>"]

  static args = [{ name: "primaryKey", require: true }]

  static flags = {
    count: Flags.string({
      char: "c",
      description: "count of parallel requests - default 10",
    }),
    amount: Flags.string({
      char: "a",
      description: "amount of CELO to transfer to each account - default 0.01",
    }),
    network: Flags.string({
      char: "n",
      description: "CELO network - default alfajores",
    }),
    gas: Flags.string({
      char: "g",
      description:
        "extra amount of CELO to transfer to each account (as gas) - default 0.001",
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Withdraw)

    const countOfParallelism = Number.parseInt(flags.count ?? "10")
    const amountOfCelo = flags.amount ?? "0.01"
    const network = flags.network ?? "alfajores"

    setVariablesBasedOnCurrentNetwork(network)

    const kit = createKit()
    const primaryAccount = addKitAccount(kit, args.primaryKey)

    this.log(`Network: ${network}`)
    this.log(`Count of parallel requests: ${countOfParallelism}`)
    this.log(`Amount of CELO to be transfered to each account: ${amountOfCelo}`)
    this.log(`Primary account: ${primaryAccount}`)

    await checkBalance(
      kit,
      primaryAccount,
      Number.parseFloat(amountOfCelo) * countOfParallelism,
      message => this.log(message),
    )

    const accountPromises: Promise<Account>[] = []

    for (let i = 0; i < countOfParallelism; i++) {
      accountPromises.push(createAccount(kit, message => this.log(message)))
    }

    const accounts = await Promise.all(accountPromises)

    const celoContract = await kit.celoTokens.contracts.getGoldToken()

    const sendTransactionPromises: Promise<CeloTxReceipt>[] = []

    const amountOfCeloWei = kit.connection.web3.utils.toWei(
      amountOfCelo,
      "ether",
    )

    const amountOfCeloWeiWithExtraGas = kit.connection.web3.utils.toWei(
      (
        Number.parseFloat(amountOfCelo) +
        Number.parseFloat(flags.gas ?? "0.001")
      ).toString(),
      "ether",
    )

    for (const account of accounts) {
      const txObject = celoContract.transfer(
        account.address,
        amountOfCeloWeiWithExtraGas,
      )
      sendTransactionPromises.push(
        txObject.sendAndWaitForReceipt({ from: primaryAccount }),
      )
      this.log(`Sending CELO to ${account.address}`)
      kit.addAccount(account.privateKey)
    }

    await Promise.all(sendTransactionPromises)

    const managerContract = getManagerContract(kit)

    const depositPromises = []

    for (const account of accounts) {
      const txObject = await managerContract.methods.deposit()

      const txDeposit = await kit.sendTransactionObject(txObject, {
        from: account.address,
        value: amountOfCeloWei,
      })
      this.log(
        `Depositing ${amountOfCelo} CELO to ${account.address} for stCELO`,
      )
      depositPromises.push(txDeposit.waitReceipt())
    }

    await Promise.all(depositPromises)

    const withdrawalPromises = []

    for (const account of accounts) {
      withdrawalPromises.push(
        withdrawStCelo(account.address, message => this.log(message)),
      )
    }

    await Promise.all(withdrawalPromises)

    await writeFile(`accounts_${network}_${countOfParallelism}_${amountOfCelo}CELO_${formatDate(new Date())}.json`, JSON.stringify(accounts))

    this.log("SUCCESS")
  }
}
