import fetch from "node-fetch"
import { networkSettings } from "./network-selector"

export async function withdrawStCelo(
  beneficiary: string,
  log: (message?: string) => void,
) {
  const body = {
    type: "withdraw",
    beneficiary: beneficiary,
  }

  log(`Calling withdrawal with account ${beneficiary}`)

  const response = await fetch(networkSettings.backend, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    log(`Error calling withdrawal with account ${beneficiary} ${JSON.stringify(response)}`)
    throw new Error(JSON.stringify(response))
  }

  return response.ok
}

export async function claimCelo(
  beneficiary: string,
  log: (message?: string) => void,
) {
  const body = {
    type: "claim",
    beneficiary: beneficiary,
  }

  log(`Calling claim with account ${beneficiary}`)

  const response = await fetch(networkSettings.backend, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    log(`Error calling claim with account ${beneficiary} ${JSON.stringify(response)}`)
    throw new Error(JSON.stringify(response))
  }

  return response.ok
}

