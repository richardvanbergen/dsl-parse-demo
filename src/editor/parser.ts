// @ts-expect-error no types
import {Grammar, Parser} from "nearley"
import grammar from "./grammar"
import type { GrammarType, ParsedGrammar, ParsedFormula, ParsedPrimitive } from './grammarTypes'

export function isGrammarType<T extends ParsedGrammar>(value: ParsedGrammar, type: GrammarType): value is T {
  return value.type === type
}

export function isPrimitive(value: ParsedGrammar): value is ParsedPrimitive {
  return ['number', 'string', 'divide', 'times', 'plus', 'minus'].includes(value.type)
}

export class IncompleteInputError extends Error {}

export function parse(formula: string) {
  const parserTest = new Parser(Grammar.fromCompiled(grammar));
  const results = parserTest.feed(formula)?.results

  if (results) {
    if (results.length > 1) {
      throw new Error("Ambiguous grammar detected.")
    }

    if (results.length < 1) {
      throw new IncompleteInputError("Syntax error. Unexpected end of input.")
    }

    if (isGrammarType<ParsedFormula>(results?.[0]?.[0], 'formula')) {
      return results[0][0]
    }

    throw new Error(`If you see this, please report a bug to the parser library with this input: ${formula}`)
  }
}
