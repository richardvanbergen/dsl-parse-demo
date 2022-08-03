export type GrammarPrimitive = 'boolean' | 'number'  | 'plus' | 'minus' | 'times' | 'divide' | 'exponent' | 'string'

export type GrammarType =  'formula' | 'function' | 'arithmetic' | 'reference' | GrammarPrimitive

export interface ParsedGrammar {
  type: GrammarType
  value: unknown
  text: string
  offset: number
  lineBreaks: number
  line: number
  col: number
}

export interface ParsedPrimitive extends ParsedGrammar {
  type: GrammarPrimitive
}

export interface ParsedBoolean extends ParsedPrimitive {
  type: 'boolean'
  value: boolean
}

export interface ParsedNumber extends ParsedPrimitive {
  type: 'number'
  value: number
}

export interface ParsedPlus extends ParsedPrimitive {
  type: 'plus'
  value: '+'
}

export interface ParsedMinus extends ParsedPrimitive {
  type: 'minus'
  value: '-'
}

export interface ParsedTimes extends ParsedPrimitive {
  type: 'times'
  value: '*'
}

export interface ParsedDivide extends ParsedPrimitive {
  type: 'divide'
  value: '/'
}

export interface ParsedExponent extends ParsedPrimitive {
  type: 'exponent'
  value: '^'
}

export interface ParsedString extends ParsedPrimitive {
  type: 'string'
  value: string
}

export interface ParsedReference extends ParsedGrammar {
  type: 'reference'
  value: {
    identifier: string
    subpath: string[]
  }
}

export interface ParsedFunction extends ParsedGrammar {
  type: 'function'
  value: {
    name: string
    params: ParsedFormulaValue[]
  }
}

export type ParsedOperator = ParsedPlus | ParsedMinus | ParsedTimes | ParsedDivide | ParsedExponent

export type ParsedFormulaValue =
  ParsedArithmetic |
  ParsedBoolean |
  ParsedNumber |
  ParsedString |
  ParsedFunction

export interface ParsedArithmetic extends ParsedGrammar {
  type: 'arithmetic'
  value: {
    left: ParsedArithmetic | ParsedNumber | ParsedReference
    operator: ParsedOperator
    right: ParsedArithmetic | ParsedNumber | ParsedReference
  }
}

export interface ParsedFormula extends ParsedGrammar {
  type: "formula"
  value: ParsedArithmetic | ParsedBoolean | ParsedNumber | ParsedFunction | ParsedReference
}
