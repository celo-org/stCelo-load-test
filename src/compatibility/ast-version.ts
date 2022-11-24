// tslint:disable: max-classes-per-file
import { Artifact } from "./internal"
import { ContractVersion, ContractVersionChecker, ContractVersionCheckerIndex, ContractVersionDelta, ContractVersionDeltaIndex, ContractVersionIndex, DEFAULT_VERSION_STRING } from "./version"
import { BuildArtifacts } from "@openzeppelin/upgrades"
import { isLibrary } from "./report"
import { Chain, Common, Hardfork } from "@ethereumjs/common"
import { DefaultStateManager } from "@ethereumjs/statemanager"
import { Blockchain } from "@ethereumjs/blockchain"
import { EEI } from "@ethereumjs/vm"
import { EVM } from "@ethereumjs/evm"
import { Address } from "@ethereumjs/util"
const abi = require("ethereumjs-abi")

/**
 * A mapping {contract name => {@link ContractVersion}}.
 */
export class ASTContractVersions {
  static fromArtifacts = async (artifacts: BuildArtifacts): Promise<ASTContractVersions> => {
    const contracts: ContractVersionIndex = {}

    await Promise.all(artifacts.listArtifacts().filter(c => !isLibrary(c.contractName, artifacts)).map(async artifact => {
      contracts[artifact.contractName] = await getContractVersion(artifact)
    }))
    return new ASTContractVersions(contracts)
  }

  constructor(public readonly contracts: ContractVersionIndex) {}
}

/**
 * Gets the version of a contract by calling Contract.getVersionNumber() on
 * the contract deployed bytecode.
 *
 * If the contract version cannot be retrieved, returns version 1.1.0.0 by default.
 */
export async function getContractVersion(artifact: Artifact): Promise<ContractVersion> {
  const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.London })
  const stateManager = new DefaultStateManager()
  const blockchain = await Blockchain.create()
  const eei = new EEI(stateManager, common, blockchain)

  const evm = new EVM({
    common,
    eei,
  })

  const bytecode = artifact.deployedBytecode
  const data = "0x" + abi.methodID("getVersionNumber", []).toString("hex")
  const nullAddress = "0000000000000000000000000000000000000000"
  // Artificially link all libraries to the null address.
  const linkedBytecode = bytecode.split(/_+[\dA-Za-z]+_+/).join(nullAddress)
  const result = await evm.runCall({
    to: Address.zero(),
    caller: Address.zero(),
    code: Buffer.from(linkedBytecode.slice(2), "hex"),
    isStatic: true,
    data: Buffer.from(data.slice(2), "hex"),
  })
  if (result.execResult.exceptionError === undefined) {
    const value = result.execResult.returnValue
    if (value.length === 4 * 32) {
      return ContractVersion.fromGetVersionNumberReturnValue(value)
    }
  }

  // If we can't fetch the version number, assume default version.
  return ContractVersion.fromString(DEFAULT_VERSION_STRING)
}

export class ASTContractVersionsChecker {
  static create = async (oldArtifacts: BuildArtifacts, newArtifacts: BuildArtifacts, expectedVersionDeltas: ContractVersionDeltaIndex): Promise<ASTContractVersionsChecker> => {
    const oldVersions = await ASTContractVersions.fromArtifacts(oldArtifacts)
    const newVersions = await ASTContractVersions.fromArtifacts(newArtifacts)
    const contracts: ContractVersionCheckerIndex = {}
    Object.keys(newVersions.contracts).map((contract:string) => {
      const versionDelta = expectedVersionDeltas[contract] === undefined ? ContractVersionDelta.fromChanges(false, false, false, false) : expectedVersionDeltas[contract]
      const oldVersion = oldVersions.contracts[contract] === undefined ? null : oldVersions.contracts[contract]
      contracts[contract] = new ContractVersionChecker(oldVersion!, newVersions.contracts[contract], versionDelta)
    })
    return new ASTContractVersionsChecker(contracts)
  }

  constructor(public readonly contracts: ContractVersionCheckerIndex) {}

  /**
   * @return a new {@link ASTContractVersionsChecker} with the same contracts
   * excluding all those whose names match the {@param exclude} parameters.
   */
  excluding = (exclude: RegExp): ASTContractVersionsChecker => {
    const included = (contract: string): boolean => {
      // eslint-disable-next-line no-eq-null, eqeqeq
      if (exclude != null) {
        return !exclude.test(contract)
      }

      return true
    }

    const contracts: ContractVersionCheckerIndex = {}
    Object.keys(this.contracts).filter(included).map((contract: string) => {
      contracts[contract] = this.contracts[contract]
    })
    return new ASTContractVersionsChecker(contracts)
  }

  public mismatches = () : ASTContractVersionsChecker => {
    const mismatches: ContractVersionCheckerIndex = {}
    // eslint-disable-next-line array-callback-return
    Object.keys(this.contracts).map((contract: string) => {
      if (!this.contracts[contract].matches()) {
        mismatches[contract] = this.contracts[contract]
      }
    })
    return new ASTContractVersionsChecker(mismatches)
  }

  public isEmpty = (): boolean => {
    return Object.keys(this.contracts).length === 0
  }
}
