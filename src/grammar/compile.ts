import {
  ParsedFormula,
  ParsedArithmetic,
  ParsedGrammar,
  isGrammarType,
  isPrimitive
} from "./parser";

type Compiler<T extends ParsedGrammar = ParsedGrammar> = (value: T) => string

const compilePrimitive: Compiler = (value: ParsedGrammar) => {
  if (isPrimitive(value)) {
    return value.text
  }

  throw new Error(`Expected primitive, got ${value.type}`)
}

const compileArithmeticSide = (value: ParsedGrammar): string => {
  if (isGrammarType<ParsedArithmetic>(value, 'arithmetic')) {
    return compileArithmetic(value)
  }

  return compilePrimitive(value)
}

const compileArithmetic: Compiler = (arithmetic: ParsedGrammar) => {
  if (isGrammarType<ParsedArithmetic>(arithmetic, "arithmetic")) {
    const left = compileArithmeticSide(arithmetic.value.left)
    const operator = arithmetic.value.operator
    const right = compileArithmeticSide(arithmetic.value.right)

    return `${left} ${operator} ${right}`
  }

  return compilePrimitive(arithmetic)
}

export const compileFormula: Compiler<ParsedFormula> = (formula: ParsedFormula) => {
  if (isGrammarType<ParsedArithmetic>(formula.value, "arithmetic")) {
    return compileArithmetic(formula.value)
  }

  return compilePrimitive(formula.value)
}
