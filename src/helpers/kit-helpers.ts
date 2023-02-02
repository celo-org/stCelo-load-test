import { privateKeyToAddress } from "@celo/utils/lib/address"
import { ContractKit, newKit } from "@celo/contractkit"

import { networkSettings } from "./network-selector"
import { Account } from "web3-core"

export function addKitAccount(kit: ContractKit, privateKey: string): string {
  if (privateKey !== undefined) {
    kit.connection.addAccount(privateKey)
    const signerAddress = privateKeyToAddress(privateKey)
    return signerAddress
  }

  throw new Error("Incorrect env config")
}

export function createKit(): ContractKit {
  return newKit(networkSettings.httpUrl)
}

export async function closeKitConnection(kit: ContractKit) {
  try {
    const isListening = await kit.connection.isListening()
    if (isListening) {
      kit.connection.stop()
    }
  } catch (error) {
    throw new Error(`Failed to close KIT connection: ${error}`)
  }
}

export function isProperAddress(kit: ContractKit, beneficiary: string) {
  if (!kit.web3.utils.isAddress(beneficiary)) {
    throw new Error("Invalid Beneficiary Address")
  }
}

export async function checkBalance(
  kit: ContractKit,
  address: string,
  minimumBalance: number,
  log: (message?: string) => void,
) {
  const totalBalances = await kit.getTotalBalance(address)
  const threshold = kit.web3.utils.toWei(
    kit.web3.utils.toBN(minimumBalance * 1000).div(kit.web3.utils.toBN("1000")),
  )

  if (totalBalances.CELO?.lt(threshold.toString())) {
    const msg = `Account balance low: ${kit.web3.utils.fromWei(
      totalBalances.CELO.toString(),
    )} CELO expected: ${minimumBalance} CELO`
    log(msg)
    throw new Error(msg)
  }
}

export async function createAccount(
  kit: ContractKit,
  log: (message?: string) => void,
): Promise<Account> {
  const account = kit.web3.eth.accounts.create()
  log(`Account created ${account.address}`)
  return account
}
