import { Command, Flags } from "@oclif/core"
import dateFormat from "dateformat"
import { Account } from "web3-core"
import { activateAndVote, withdrawStCelo } from "../helpers/backend-helper"
import { getManagerContract } from "../helpers/contract-helpers"
import {
  addKitAccount,
  checkBalance,
  createAccount,
  createKit,
} from "../helpers/kit-helpers"
import { setVariablesBasedOnCurrentNetwork } from "../helpers/network-selector"
import { writeFile } from "node:fs/promises"
import { FileContent } from "../interfaces/file-content"

export default class Withdraw extends Command {
  static description = "load test of withdrawal"

  static examples = ["load-test withdrawal <primary_key> -c 25"]

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
      description: "extra amount of CELO to transfer to each account (as gas) ",
      default: "0.001",
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
    const gas = Number.parseFloat(flags.gas ?? "0.001")

    this.log(`Network: ${network}`)
    this.log(`Count of parallel requests: ${countOfParallelism}`)
    this.log(`Amount of CELO to be transfered to each account: ${amountOfCelo}`)
    this.log(`Primary account: ${primaryAccount}`)
    this.log(`Extra CELO as gas sent: ${gas}`)

    await checkBalance(
      kit,
      primaryAccount,
      Number.parseFloat(amountOfCelo + gas) * countOfParallelism,
      (message) => this.log(message)
    )

    const accountPromises: Promise<Account>[] = []

    for (let i = 0; i < countOfParallelism; i++) {
      accountPromises.push(createAccount(kit, (message) => this.log(message)))
    }

    const accounts = await Promise.all(accountPromises)

    const amountOfCeloWei = kit.connection.web3.utils.toWei(
      amountOfCelo,
      "ether"
    )

    const amountOfCeloWeiWithExtraGas = kit.connection.web3.utils.toWei(
      (
        Number.parseFloat(amountOfCelo) +
        gas
      ).toString(),
      "ether"
    )

    const sendCeloTransactionResultPromises = accounts.map((a) => {
      this.log(`Sending CELO to ${a.address}`)
      kit.addAccount(a.privateKey)

      return kit.sendTransaction({
        to: a.address,
        value: amountOfCeloWeiWithExtraGas,
        from: primaryAccount,
      })
    })

    const sendCeloTransactionResult = await Promise.all(
      sendCeloTransactionResultPromises
    )
    await Promise.all(sendCeloTransactionResult.map((k) => k.waitReceipt()))

    const managerContract = getManagerContract(kit)

    const txObject = managerContract.methods.deposit()
    const depositTransactionPromises = accounts.map((a) => {
      this.log(`Depositing ${amountOfCelo} CELO to ${a.address} for stCELO`)
      return kit.sendTransactionObject(txObject, {
        from: a.address,
        value: amountOfCeloWei,
      })
    })

    const depositTransactions = await Promise.all(depositTransactionPromises)
    await Promise.all(depositTransactions.map((k) => k.waitReceipt()))

    const withdrawalPromises = accounts.map((a) =>
      withdrawStCelo(a.address, (message) => this.log(message))
    )

    await Promise.all(withdrawalPromises)

    await activateAndVote(message => this.log(message))

    const now = new Date()
    await writeFile(
      `accounts_${network}_${countOfParallelism}_${amountOfCelo}CELO_${dateFormat(
        now,
        "yyyymmdd_hhMMss",
      )}.json`,
      JSON.stringify({
        accounts,
        timestamp: now.getTime(),
        network: network,
      } as FileContent),
    )

    this.log("SUCCESS")
  }
}
