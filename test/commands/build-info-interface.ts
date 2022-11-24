export interface BuildInfoInterface {
  id: string
  _format: string
  solcVersion: string
  solcLongVersion: string
  input: Input
  output: Output
}

export interface Input {
  language: string
  sources: Record<string, any>
  settings: Settings
}

export interface Settings {
  evmVersion: string
  metadata: Metadata
  optimizer: Optimizer
  outputSelection: OutputSelection
}

export interface Metadata {
  useLiteralContent: boolean
}

export interface Optimizer {
  enabled: boolean
  runs: number
}

export interface OutputSelection {
  "*": GeneratedType
}

export interface GeneratedType {
  "*": string[]
  "": string[]
}

export interface Output {
  contracts: Record<string, Record<string, any>>
  sources: Record<string, OutputSource>
}

export interface OutputSource {
  ast: any,
  id: number
}
