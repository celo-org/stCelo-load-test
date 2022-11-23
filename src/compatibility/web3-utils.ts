/* tslint:disable:no-console */
// TODO(asa): Refactor and rename to 'deployment-utils.ts'
import prompts from "prompts"

export async function retryTx(fn: any, args: any[]) {
  while (true) {
    try {
      const rvalue = await fn(...args)
      return rvalue
    } catch (error) {
      console.error(error)
      // @ts-ignore
      const { confirmation } = await prompts({
        type: "confirm",
        name: "confirmation",
        // @ts-ignore: typings incorrectly only accept string.
        initial: true,
        message: "Error while sending tx. Try again?",
      })
      if (!confirmation) {
        throw error
      }
    }
  }
}
