import { Command, Flags } from "@oclif/core"
import { claimCelo } from "../helpers/backend-helper"
import { setVariablesBasedOnCurrentNetwork } from "../helpers/network-selector"
import { readFile } from "node:fs/promises"
import { FileContent } from "../interfaces/file-content"
import {
  getAccountContract,
  getAccountEventValues,
} from "../helpers/contract-helpers"
import { createKit } from "../helpers/kit-helpers"

export default class Claim extends Command {
  static description = "load test of claim"

  static examples = ["load-test claim withdrawals_20220818_135645.json"]

  static args = [{ name: "file", require: true }]

  static flags = {
    network: Flags.string({
      char: "n",
      description: "CELO network - default alfajores",
      default: "alfajores",
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Claim)

    const accountsString = (await readFile(args.file)).toString()
    const fileContent = JSON.parse(accountsString) as FileContent

    setVariablesBasedOnCurrentNetwork(flags.network)

    const kit = createKit()

    this.log(`Network: ${flags.network}`)

    const accountContract = getAccountContract(kit)

    const getPendingWithDrawalsCallsPromises = fileContent.accounts.map(
      async (account) => {
        kit.addAccount(account.privateKey)
        const pendingWithdrawals = await accountContract.methods
          .getPendingWithdrawals(account.address)
          .call({
            from: account.address,
          })
        const highestTimestamp = [...pendingWithdrawals.timestamps]
          .sort()
          .slice(-1)[0]
        return {
          ...pendingWithdrawals,
          address: account.address,
          highestTimestamp: highestTimestamp
            ? new Date(highestTimestamp * 1000)
            : undefined,
        }
      }
    )

    const getPendingWithDrawalsCalls = await Promise.all(
      getPendingWithDrawalsCallsPromises
    )

    const now = new Date()
    const accountsWithoutPendingWithdrawals = getPendingWithDrawalsCalls
      .filter((withdrawal) => withdrawal.highestTimestamp === undefined)
      .map((withdrawal) => withdrawal.address)

    if (accountsWithoutPendingWithdrawals.length > 0) {
      throw new Error(
        `These accounts cannot claim stCELO since they have no pending withdrawals ${JSON.stringify(
          accountsWithoutPendingWithdrawals,
        )}`,
      )
    }

    const accountsWithoutClaimableWithdrawals = getPendingWithDrawalsCalls
      .filter((withdrawal) => withdrawal.highestTimestamp > now)
      .map((withdrawal) => withdrawal.address)

    if (accountsWithoutClaimableWithdrawals.length > 0) {
      throw new Error(`These accounts cannot claim stCELO since they have no claimable withdrawals ${JSON.stringify(
        accountsWithoutClaimableWithdrawals
      )}`)
    }

    const claimPromises = fileContent.accounts.map((account) =>
      claimCelo(account.address, (message) => this.log(message))
    )

    await Promise.all(claimPromises)

    // Validate backend claim events
    const logs = await getAccountEventValues(kit, "CeloWithdrawalFinished")

    const allAccountsWithWithdrawalEvent = new Set(
      logs.map((log) => log.beneficiary)
    )
    const accountsWithoutBackendWithdrawalEvent = fileContent.accounts.filter(
      (account) => !allAccountsWithWithdrawalEvent.has(account.address)
    )
    if (accountsWithoutBackendWithdrawalEvent.length > 0) {
      throw new Error(`Following accounts don't have any claim  ${JSON.stringify(
        accountsWithoutBackendWithdrawalEvent
      )}`)
    }

    this.log("SUCCESS")
  }
}
