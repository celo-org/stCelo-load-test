/* eslint-disable camelcase */
/* eslint-disable unicorn/no-process-exit */
/* eslint-disable no-process-exit */
import { Command, Flags } from "@oclif/core"
import { ASTContractVersionsChecker } from "../compatibility/ast-version"
import { DefaultCategorizer } from "../compatibility/categorizer"
import { ASTBackwardReport, instantiateArtifacts } from "../compatibility/utils"
import { writeJsonSync } from "fs-extra"
import path from "node:path"
import tmp from "tmp"

export default class ContractCompatibilityCheck extends Command {
  static description = "Compatibility check of contracts"

  static examples = [
    "contract-compatibility-check claim withdrawals_20220818_135645.json",
  ]

  static flags = {
    exclude: Flags.string({
      char: "e",
      description: "Contract name exclusion regex",
    }),
    old_contracts: Flags.string({
      char: "o",
      description: "Old contracts build artifacts folder",
      required: true,
    }),
    new_contracts: Flags.string({
      char: "n",
      description: "New contracts build artifacts folder",
      required: true,
    }),
    output_file: Flags.string({
      char: "f",
      description: "Destination file output for the compatibility report",
    }),
    quiet: Flags.boolean({
      char: "q",
      description: "Run in quiet mode (no logs)",
      default: false,
    }),
    report_only: Flags.boolean({
      char: "r",
      description: "Generate only report",
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ContractCompatibilityCheck)

    const oldArtifactsFolder = path.resolve(flags.old_contracts)
    const newArtifactsFolder = path.resolve(flags.new_contracts)

    const out = (msg: string, force?: boolean): void => {
      if (force || !flags.quiet) {
        process.stdout.write(msg)
      }
    }

    const outFile = flags.output_file ? flags.output_file : tmp.tmpNameSync({})
    const exclude: RegExp | null = flags.exclude ? new RegExp(flags.exclude) : null
    const oldArtifacts = instantiateArtifacts(oldArtifactsFolder)
    const newArtifacts = instantiateArtifacts(newArtifactsFolder)

    try {
      const backward = ASTBackwardReport.create(
        oldArtifactsFolder,
        newArtifactsFolder,
        oldArtifacts,
        newArtifacts,
        exclude!,
        new DefaultCategorizer(),
        out,
      )

      out(`Writing compatibility report to ${outFile} ...`)
      writeJsonSync(outFile, backward, { spaces: 2 })
      out("Done\n")

      if (flags.report_only) {
        return
      }

      const doVersionCheck = async () => {
        const versionChecker = await ASTContractVersionsChecker.create(
          oldArtifacts,
          newArtifacts,
          backward.report.versionDeltas(),
        )
        const mismatches = versionChecker.excluding(exclude!).mismatches()
        if (mismatches.isEmpty()) {
          out("Success! Actual version numbers match expected\n")
          process.exit(0)
        } else {
          console.error(
            `Version mismatch detected:\n${JSON.stringify(mismatches, null, 4)}`,
          )
          process.exit(1)
        }
      }

      await doVersionCheck().catch((error: any) => {
        console.error("Error when performing version check", error)
        process.exit(1)
      })
    } catch (error: any) {
      console.error(error)

      process.exit(10_003)
    }

    this.log("SUCCESS2")
  }
}
