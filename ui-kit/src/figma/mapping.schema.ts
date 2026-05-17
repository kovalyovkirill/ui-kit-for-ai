export interface FigmaVariantMap {
  figmaProperty: string
  figmaValue: string
  propName: string
  propValue: unknown
}

export interface FigmaTokenMap {
  figmaVariable: string
  tokenPath: string
  cssVar?: string
}

export interface FigmaComponentMapping {
  figmaNodeId: string
  figmaName: string
  reactComponent: string
  variants: FigmaVariantMap[]
  tokens: FigmaTokenMap[]
}
