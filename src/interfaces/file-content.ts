import { Account } from "web3-core"

export interface FileContent {
    accounts: Account[],
    timestamp: number,
    network: string
}