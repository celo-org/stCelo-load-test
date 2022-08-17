import { Command, Flags } from "@oclif/core"
import { claimCelo } from "../helpers/backend-helper"
import {
  networkSettings,
  setVariablesBasedOnCurrentNetwork,
} from "../helpers/network-selector"
import { readFile } from "node:fs/promises"
import { FileContent } from "../interfaces/file-content"
import { addHours } from "../helpers/datetime-helpers"

export default class Claim extends Command {
  static description = "load test of claim"

  static examples = [
    "load-test claim accounts_alfajores_10_0.01CELO_20220816_132253.json",
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
    const fileContent = JSON.parse(accountsString) as FileContent

    const network = flags.network ?? "alfajores"

    setVariablesBasedOnCurrentNetwork(network)

    this.log(`Network: ${network}`)

    if (
      addHours(networkSettings.withdrawalTimeout, new Date(fileContent.timestamp)) >
        new Date()
    ) {
      const msg = `These accounts cannot claim stCELO yet since network claim timeout is ${networkSettings.withdrawalTimeout} hours`
      this.log(msg)
      throw new Error(msg)
    }

    const claimPromises = fileContent.accounts.map(a => claimCelo(a.address, message => this.log(message)))

    await Promise.all(claimPromises)

    this.log("SUCCESS")
  }
}
