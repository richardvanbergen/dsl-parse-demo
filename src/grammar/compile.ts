import {
  isGrammarType,
  isPrimitive,
  ParsedBoolean,
  ParsedReference,
  ParsedFormula,
  ParsedArithmetic,
  ParsedGrammar, ParsedFunction, ParsedPrimitive,
} from "./parser";

type Compiler<T extends ParsedGrammar> = (value: T) => string

export const compilePrimitive: Compiler<ParsedPrimitive> = (value) => {
  if (isGrammarType<ParsedBoolean>(value, 'boolean')) {
    return value.text === 'true' ? 'true' : 'false'
  }

  return value.text
}

export const compileReference: Compiler<ParsedReference> = (reference): string => {
  let combine = [reference.value.identifier]
  if (reference.value.subpath && reference.value.subpath.length > 0) {
    combine = [...combine, ...reference.value.subpath]
  }

  return combine.join('.')
}

export const compileBranch: Compiler<ParsedGrammar> = (param): string => {
  if (isGrammarType<ParsedArithmetic>(param, 'arithmetic')) {
    return compileArithmetic(param)
  }

  if (isGrammarType<ParsedFunction>(param, 'function')) {
    return compileFunction(param)
  }

  if (isGrammarType<ParsedReference>(param, 'reference')) {
    return compileReference(param)
  }

  if (isPrimitive(param)) {
    return compilePrimitive(param)
  }

  throw new Error(`Unsupported grammar type: ${param.type}`)
}

export const compileArithmetic: Compiler<ParsedArithmetic> = (arithmetic) => {
  if (isGrammarType<ParsedArithmetic>(arithmetic, 'arithmetic')) {
    const left = compileBranch(arithmetic.value.left)
    const operator = arithmetic.value.operator
    const right = compileBranch(arithmetic.value.right)

    return `(${left} ${operator} ${right})`
  }

  return compilePrimitive(arithmetic)
}

export const compileFunction: Compiler<ParsedFunction> = (functionValue): string => {
  const values = functionValue.value.params.map(param => {
    return compileBranch(param)
  })

  return `${functionValue.value.name}(${values.join(', ')})`
}

export const compileFormula: Compiler<ParsedFormula> = (formula) => {
  return compileBranch(formula.value)
}
