import {
  ALFAJORES_ACCOUNT_CONTRACT_ADDRESS,
  ALFAJORES_HTTP_URL,
  ALFAJORES_MANAGER_CONTRACT_ADDRESS,
  ALFAJORES_ST_CELO_ADDRESS,
  ALFAJORES_ACCOUNT_WITH_CELO,
  ALFAJORES_CELO_ADDRESS,
  ALFAJORES_MAINNET_BACKEND,
  ALFAJORES_WITHDRAWAL_TIMEOUT,
  ACCOUNT_CONTRACT_ADDRESS,
  HTTP_URL,
  MANAGER_CONTRACT_ADDRESS,
  ST_CELO_ADDRESS,
  ACCOUNT_WITH_CELO,
  CELO_ADDRESS,
  BACKEND_URL,
  WITHDRAWAL_TIMEOUT,
} from "../static-variables"

export interface NetworkSettings {
  accountContractAddress: string
  managerContractAddress: string
  httpUrl: string
  stCeloContractAddress: string
  accountWithCelo: string
  celoContractAddress: string
  backendUrl: string
  withdrawalTimeout: number
}

export let networkSettings: NetworkSettings

export function setVariablesBasedOnCurrentNetwork(network: string) {
  switch (network) {
    case "mainnet":
      setMainnetVariables()
      break
    case "alfajores":
      setAlfajoresVariables()
      break
    default:
      throw new Error(`Network ${network} not supported.`)
  }
}

function setMainnetVariables() {
  networkSettings = {
    accountContractAddress: ACCOUNT_CONTRACT_ADDRESS,
    managerContractAddress: MANAGER_CONTRACT_ADDRESS,
    stCeloContractAddress: ST_CELO_ADDRESS,
    httpUrl: HTTP_URL,
    accountWithCelo: ACCOUNT_WITH_CELO,
    celoContractAddress: CELO_ADDRESS,
    backendUrl: BACKEND_URL,
    withdrawalTimeout: WITHDRAWAL_TIMEOUT,
  }
}

function setAlfajoresVariables() {
  networkSettings = {
    accountContractAddress: ALFAJORES_ACCOUNT_CONTRACT_ADDRESS,
    managerContractAddress: ALFAJORES_MANAGER_CONTRACT_ADDRESS,
    stCeloContractAddress: ALFAJORES_ST_CELO_ADDRESS,
    httpUrl: ALFAJORES_HTTP_URL,
    accountWithCelo: ALFAJORES_ACCOUNT_WITH_CELO,
    celoContractAddress: ALFAJORES_CELO_ADDRESS,
    backendUrl: ALFAJORES_MAINNET_BACKEND,
    withdrawalTimeout: ALFAJORES_WITHDRAWAL_TIMEOUT,
  }
}
