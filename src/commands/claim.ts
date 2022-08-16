import { Command, Flags } from "@oclif/core"
import { Account } from "web3-core"
import { claimCelo } from "../helpers/backend-helper"
import {
  networkSettings,
  setVariablesBasedOnCurrentNetwork,
} from "../helpers/network-selector"
import { readFile } from "node:fs/promises"
import { addHours, parseExistingFileName } from "../helpers/filename-helper"

export default class Claim extends Command {
  static description = "load test of claim"

  static examples = [
    "oex claim accounts_alfajores_10_0.01CELO_20220816_132253.json",
  ]

  static args = [{ name: "file", require: true }]

  static flags = {
    network: Flags.string({
      char: "n",
      description: "CELO network - default alfajores",
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Claim)

    const accountsString = (await readFile(args.file)).toString()
    const accounts = JSON.parse(accountsString) as Account[]

    const network = flags.network ?? "alfajores"

    setVariablesBasedOnCurrentNetwork(network)

    this.log(`Network: ${network}`)

    const parsedFileName = parseExistingFileName(args.file)

    if (
      parsedFileName !== null &&
      addHours(networkSettings.withdrawalTimeout, parsedFileName.datetime) >
        new Date()
    ) {
      const msg = `These accounts cannot claim stCELO yet since network claim timeout is ${networkSettings.withdrawalTimeout} hours`
      this.log(msg)
      throw new Error(msg)
    }

    const claimPromises = []

    for (const account of accounts) {
      claimPromises.push(
        claimCelo(account.address, message => this.log(message)),
      )
    }

    await Promise.all(claimPromises)

    this.log("SUCCESS")
  }
}
