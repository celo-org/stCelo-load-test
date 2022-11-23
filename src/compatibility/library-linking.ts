import { ASTCodeCompatibilityReport } from "./ast-code"
import { LibraryLinkingChange } from "./change"
import { ContractDependencies } from "./contract-dependencies"

// For each contract whose linked library dependencies have been updated, keeps
// a list of those updated libraries.
interface LibraryLinkingReport {
  [contract: string]: string[]
}

const getChangedLinkedLibraries = (linkedLibraries: string[], codeReport: ASTCodeCompatibilityReport) => {
  const changedLinkedLibraries = new Set()

  for (const change of codeReport.getChanges()) {
    if (linkedLibraries.includes(change.getContract())) {
      changedLinkedLibraries.add(change.getContract())
    }
  }

  return changedLinkedLibraries
}

const reportToChanges = (report: LibraryLinkingReport): LibraryLinkingChange[] => {
  return Object.keys(report).flatMap(contract => {
    return report[contract].map(library => new LibraryLinkingChange(contract, library))
  })
}

export const reportLibraryLinkingIncompatibilities = (linkedLibraries: { [library: string]: string[] }, codeReport: ASTCodeCompatibilityReport): LibraryLinkingChange[] => {
  const dependencies = new ContractDependencies(linkedLibraries)

  const changedLinkedLibraries = getChangedLinkedLibraries(Object.keys(linkedLibraries), codeReport)
  const libraryLinkingReport: LibraryLinkingReport = {}

  // To robustly handle the possibility of multiple layers of linking, we
  // iterate until `changedLinkedLibraries` stabilizes.
  let previousChangedLinkedLibrariesSize = 0
  while (previousChangedLinkedLibrariesSize !== changedLinkedLibraries.size) {
    previousChangedLinkedLibrariesSize = changedLinkedLibraries.size
    dependencies.dependencies.forEach((libraries: string[], contract: string) => {
      const relevantChangedLibraries =
        libraries.filter(library => changedLinkedLibraries.has(library))

      if (relevantChangedLibraries.length > 0) {
        libraryLinkingReport[contract] = relevantChangedLibraries

        // Is this contract is a linked library itself? If so, add it to the
        // set.
        if (linkedLibraries[contract]) {
          changedLinkedLibraries.add(contract)
        }
      }
    })
  }

  return reportToChanges(libraryLinkingReport)
}
