// @ts-expect-error no types
import {Grammar, Parser} from "nearley"
import grammar from "./grammar"

export interface ParsedGrammar {
  type: 'boolean' | 'number' | 'formula' | 'function' | 'arithmetic' | 'plus' | 'minus' | 'times' | 'divide' | 'string' | 'reference'
  value: unknown
  text: string
  offset: number
  lineBreaks: number
  line: number
  col: number
}

export interface ParsedBoolean extends ParsedGrammar {
  type: 'boolean'
  value: boolean
}

export interface ParsedNumber extends ParsedGrammar {
  type: 'number'
  value: number
}

export interface ParsedPlus extends ParsedGrammar {
  type: 'number'
  value: '+'
}

export interface ParsedMinus extends ParsedGrammar {
  type: 'minus'
  value: '-'
}

export interface ParsedTimes extends ParsedGrammar {
  type: 'times'
  value: '*'
}

export interface ParsedDivide extends ParsedGrammar {
  type: 'divide'
  value: '/'
}

export interface ParsedString extends ParsedGrammar {
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

export type ParsedOperator = ParsedPlus | ParsedMinus | ParsedTimes | ParsedDivide
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

export type Parsed = ParsedFormula

export function isFormula(value: ParsedGrammar): value is ParsedFormula {
  return value.type === 'formula'
}

export function isFunction(value: ParsedGrammar): value is ParsedFunction {
  return value.type === 'function'
}

export function isReference(value: ParsedGrammar): value is ParsedReference {
  return value.type === 'reference'
}

export class IncompleteInputError extends Error {}

export function parse(input: string) {
  const parserTest = new Parser(Grammar.fromCompiled(grammar));
  const results = parserTest.feed(input)?.results

  if (results) {
    if (results.length > 1) {
      throw new Error("Ambiguous grammar detected.")
    }

    if (results.length < 1) {
      throw new IncompleteInputError("Syntax error. Unexpected end of input.")
    }

    return results?.[0] as Parsed[]
  }
}
