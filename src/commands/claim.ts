import { Command, Flags } from "@oclif/core"

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

    console.log(args, flags)
    this.log("SUCCESS")
  }
}
