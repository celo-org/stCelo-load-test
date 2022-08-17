import accountContractData from "../lib/abi/accountAbi.json"
import managerContractData from "../lib/abi/managerAbi.json"
import electionContractData from "../lib/abi/electionAbi.json"
import stCeloContractData from "../lib/abi/stCeloAbi.json"
import { networkSettings } from "./network-selector"
import { ContractKit } from "@celo/contractkit"

export function getAccountContract(kit: ContractKit) {
  return new kit.web3.eth.Contract(accountContractData.abi as any, networkSettings.accountContractAddress)
}

export function getManagerContract(kit: ContractKit) {
  return new kit.web3.eth.Contract(managerContractData.abi as any, networkSettings.managerContractAddress)
}

export function getElectionContract(kit: ContractKit, electionContractAddress: string) {
  return new kit.web3.eth.Contract(electionContractData.abi as any, electionContractAddress)
}

export function getCeloContract(kit: ContractKit) {
  return new kit.web3.eth.Contract(electionContractData.abi as any, networkSettings.celoContractAddress)
}

export function getStCeloContract(kit: ContractKit) {
  return new kit.web3.eth.Contract(stCeloContractData.abi as any, networkSettings.stCeloContractAddress)
}
