import { expect, test } from "@oclif/test"

describe("withdraw", () => {
  test
    .stdout()
    .command([
      "withdraw",
      "INSERT_YOUR_PRIVATE_KEY",
    ])
    .timeout(99999999)
    .it("runs withdrawal", (ctx) => {
      console.log(ctx.stdout)
      expect(ctx.stdout).to.contain("SUCCESS")
    })
}).timeout(99999999)
