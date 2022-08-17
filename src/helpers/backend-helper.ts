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

  log(`Calling backend withdrawal with account ${beneficiary}`)

  const response = await fetch(networkSettings.backendUrl, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    log(`Error calling backend withdrawal with account ${beneficiary} ${response.status} ${JSON.stringify(response)}`)
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

  log(`Calling backend claim with account ${beneficiary}`)

  const response = await fetch(networkSettings.backendUrl, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    log(`Error calling backend claim with account ${beneficiary} ${response.status} ${JSON.stringify(response)}`)
    throw new Error(JSON.stringify(response))
  }

  return response.ok
}

export async function activateAndVote(
  log: (message?: string) => void,
) {
  const body = {
    type: "activate",
  }

  log("Calling backend activate")

  const response = await fetch(networkSettings.backendUrl, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    log(`Error calling backend activate ${response.status} ${JSON.stringify(response)}`)
    throw new Error(JSON.stringify(response))
  }

  return response.ok
}

