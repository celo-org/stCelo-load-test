import { expect, test } from "@oclif/test"

describe("claim", () => {
  test
    .stdout()
    .command(["claim", "INSERT_FILE_PATH"])
    .timeout(99999999)
    .it("runs claim", (ctx) => {
      expect(ctx.stdout).to.contain("SUCCESS")
    })
}).timeout(99999999)
