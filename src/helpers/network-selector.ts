import {
  ALFAJORES_ACCOUNT_CONTRACT_ADDRESS,
  ALFAJORES_HTTP_URL,
  ALFAJORES_MANAGER_CONTRACT_ADDRESS,
  ALFAJORES_ST_CELO_ADDRESS,
  ALFAJORES_ACCOUNT_WITH_CELO,
  MAINNET_ACCOUNT_CONTRACT_ADDRESS,
  MAINNET_HTTP_URL,
  MAINNET_MANAGER_CONTRACT_ADDRESS,
  MAINNET_ST_CELO_ADDRESS,
  MAINNET_ACCOUNT_WITH_CELO,
  ALFAJORES_CELO_ADDRESS,
  MAINNET_CELO_ADDRESS,
  MAINNET_BACKEND,
  ALFAJORES_MAINNET_BACKEND,
} from "../static-variables"

export interface NetworkSettings {
  accountContractAddress: string
  managerContractAddress: string
  httpUrl: string
  stCeloContractAddress: string
  accountWithCelo: string
  celoContractAddress: string
  backend: string
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
    accountContractAddress: MAINNET_ACCOUNT_CONTRACT_ADDRESS,
    managerContractAddress: MAINNET_MANAGER_CONTRACT_ADDRESS,
    stCeloContractAddress: MAINNET_ST_CELO_ADDRESS,
    httpUrl: MAINNET_HTTP_URL,
    accountWithCelo: MAINNET_ACCOUNT_WITH_CELO,
    celoContractAddress: MAINNET_CELO_ADDRESS,
    backend: MAINNET_BACKEND,
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
    backend: ALFAJORES_MAINNET_BACKEND,
  }
}
