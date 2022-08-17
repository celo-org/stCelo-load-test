import { Command, Flags } from "@oclif/core"
import { claimCelo } from "../helpers/backend-helper"
import {
  setVariablesBasedOnCurrentNetwork,
} from "../helpers/network-selector"
import { readFile } from "node:fs/promises"
import { FileContent } from "../interfaces/file-content"
import { getAccountContract } from "../helpers/contract-helpers"
import { createKit } from "../helpers/kit-helpers"

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

    const kit = createKit()

    this.log(`Network: ${network}`)

    const accountContract = getAccountContract(kit)

    const getPendingWithDrawalsCallsPromises = fileContent.accounts.map(
      async (a) => {
        kit.addAccount(a.privateKey)
        const res = await accountContract.methods
          .getPendingWithdrawals(a.address)
          .call({
            from: a.address,
          })
        const highestTimestamp = [...res.timestamps].sort().slice(-1)[0]
        return { ...res, address: a.address, highestTimestamp: new Date((highestTimestamp ?? 0) * 1000) }
      },
    )

    const getPendingWithDrawalsCalls = await Promise.all(
      getPendingWithDrawalsCallsPromises
    )

    const now = new Date()
    const accountsWithoutPendingWithdrawals = getPendingWithDrawalsCalls
      .filter((r) => r.highestTimestamp > now)
      .map((r) => r.address)

    if (
      accountsWithoutPendingWithdrawals.length > 0
    ) {
      const msg = `These accounts cannot claim stCELO since they have no pending withdrawals ${JSON.stringify(
        accountsWithoutPendingWithdrawals
      )}`
      this.log(msg)
      throw new Error(msg)
    }

    const claimPromises = fileContent.accounts.map((a) =>
      claimCelo(a.address, (message) => this.log(message))
    )

    await Promise.all(claimPromises)

    this.log("SUCCESS")
  }
}
