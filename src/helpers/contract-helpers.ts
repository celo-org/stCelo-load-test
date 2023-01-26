import accountContractData from "../lib/abi/accountAbi.json"
import managerContractData from "../lib/abi/managerAbi.json"
import electionContractData from "../lib/abi/electionAbi.json"
import stCeloContractData from "../lib/abi/stCeloAbi.json"
import { networkSettings } from "./network-selector"
import { ContractKit } from "@celo/contractkit"
import InputDataDecoder from "ethereum-input-data-decoder"

export function getAccountContract(kit: ContractKit) {
  return new kit.web3.eth.Contract(
    accountContractData.abi as any,
    networkSettings.accountContractAddress
  )
}

export function getManagerContract(kit: ContractKit) {
  return new kit.web3.eth.Contract(
    managerContractData.abi as any,
    networkSettings.managerContractAddress
  )
}

export function getElectionContract(
  kit: ContractKit,
  electionContractAddress: string
) {
  return new kit.web3.eth.Contract(
    electionContractData.abi as any,
    electionContractAddress
  )
}

export function getCeloContract(kit: ContractKit) {
  return new kit.web3.eth.Contract(
    electionContractData.abi as any,
    networkSettings.celoContractAddress
  )
}

export function getStCeloContract(kit: ContractKit) {
  return new kit.web3.eth.Contract(
    stCeloContractData.abi as any,
    networkSettings.stCeloContractAddress
  )
}

export async function getAccountEventValues(
  kit: ContractKit,
  eventName: string,
  fromBlock?: number,
  toBlock?: number
) {
  const latestBlock = await kit.web3.eth.getBlockNumber()
  const blockFiveMinutesAgo = latestBlock - 12 * 5 // 12 blocks per minute * 5 minutes
  const accountContract = getAccountContract(kit)
  const logs = await accountContract.getPastEvents(eventName, {
    fromBlock: fromBlock ?? blockFiveMinutesAgo,
    toBlock: toBlock ?? latestBlock,
  })
  return logs.map((log) => log.returnValues)
}

export async function getAccountContractTransactions(
  kit: ContractKit,
  fromBlock?: number,
  toBlock?: number
) {
  const latestBlock = await kit.web3.eth.getBlockNumber()
  const blockFiveMinutesAgo = latestBlock - 12 * 5 // 12 blocks per minute * 5 minutes

  const from = fromBlock ?? blockFiveMinutesAgo
  const to = toBlock ?? latestBlock

  const decoder = new InputDataDecoder(accountContractData.abi)

  const transactionsFromContractPromises = Array(to + 1 - from) // +1 to include the latest block.
    .fill(from)
    .map((value, index) => value + index)
    .map(async (blockNumber) => {
      const block = await kit.web3.eth.getBlock(blockNumber)
      const transactionPromises = block.transactions.map(async (txHash) => {
        const tx = await kit.web3.eth.getTransaction(txHash)

        if (tx.to === networkSettings.accountContractAddress) {
          const decoded = decoder.decodeData(tx.input)

          const values = {} as Record<string, any>
          for (let i = 0; i < decoded.names.length; i++) {
            const name = decoded.names[i] as string
            values[name] = decoded.inputs[i]
          }

          return {
            tx: txHash,
            method: decoded.method,
            from: tx.from,
            to: tx.to,
            values,
          }
        }

        return null
      })
      const transactions = await Promise.all(transactionPromises)
      return transactions.filter((tx) => tx)
    })

  const transactionsFromContract = await Promise.all(
    transactionsFromContractPromises
  )

  return transactionsFromContract.flat()
}
