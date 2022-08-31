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

  return post(body)
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

  return post(body)
}

export async function activateAndVote(
  log: (message?: string) => void,
) {
  const body = {
    type: "activate",
  }

  log("Calling backend activate")

  return post(body)
}

async function post<T>(body: T) {
  const stringifiedBody = JSON.stringify(body)

  const response = await fetch(networkSettings.backendUrl, {
    method: "post",
    body: stringifiedBody,
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) {
    throw new Error(`Error calling ${networkSettings.backendUrl} with body ${stringifiedBody} 
    Response: ${response.status} ${JSON.stringify(response)}`)
  }

  return response.ok
}

