import {
  isGrammarType,
  isPrimitive,
  ParsedBoolean,
  ParsedReference,
  ParsedFormula,
  ParsedArithmetic,
  ParsedGrammar, ParsedFunction, ParsedPrimitive,
} from "./parser"

import get from "lodash/get"

type Compiler<T extends ParsedGrammar> = (value: T, inputs?: Record<string, unknown>) => string

export const compilePrimitive: Compiler<ParsedPrimitive> = (value) => {
  if (isGrammarType<ParsedBoolean>(value, 'boolean')) {
    return value.text === 'true' ? 'true' : 'false'
  }

  return value.text
}

export const compileReference: Compiler<ParsedReference> = (reference, inputs): string => {
  let combine = [reference.value.identifier]
  if (reference.value.subpath && reference.value.subpath.length > 0) {
    combine = [...combine, ...reference.value.subpath]
  }

  const value = get(inputs, combine)
  if (value) {
    return value
  }

  throw new Error(`Reference $${combine.join('.')} not found`)
}

export const compileBranch: Compiler<ParsedGrammar> = (param, inputs): string => {
  if (isGrammarType<ParsedArithmetic>(param, 'arithmetic')) {
    return compileArithmetic(param)
  }

  if (isGrammarType<ParsedFunction>(param, 'function')) {
    return compileFunction(param)
  }

  if (isGrammarType<ParsedReference>(param, 'reference')) {
    return compileReference(param, inputs)
  }

  if (isPrimitive(param)) {
    return compilePrimitive(param)
  }

  throw new Error(`Unsupported grammar type: ${param.type}`)
}

export const compileArithmetic: Compiler<ParsedArithmetic> = (arithmetic, inputs) => {
  if (isGrammarType<ParsedArithmetic>(arithmetic, 'arithmetic')) {
    const left = compileBranch(arithmetic.value.left, inputs)
    const operator = arithmetic.value.operator
    const right = compileBranch(arithmetic.value.right, inputs)

    return `(${left} ${operator} ${right})`
  }

  return compilePrimitive(arithmetic)
}

export const compileFunction: Compiler<ParsedFunction> = (functionValue: ParsedFunction): string => {
  const values = functionValue.value.params.map(param => {
    return compileBranch(param)
  })

  return `${functionValue.value.name}(${values.join(', ')})`
}

export const compileFormula: Compiler<ParsedFormula> = (formula, inputs) => {
  return compileBranch(formula.value, inputs)
}
