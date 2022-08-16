import { expect, test } from "@oclif/test"

describe("withdraw", () => {
  test
    .stdout()
    .command([
      "withdraw",
      "0c9d867bea2e2312309b85593f50c38f405ed1c0ca97e8fff892e11186cf1019",
    ])
    .timeout(99999999)
    .it("runs withdrawal", (ctx) => {
      console.log(ctx.stdout)
      expect(ctx.stdout).to.contain("SUCCESS")
    })
}).timeout(99999999)
