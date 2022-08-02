import {
  isGrammarType,
  isPrimitive,
  ParsedFormula,
  ParsedGrammar,
  ParsedArithmetic,
  ParsedFunction, ParsedReference, ParsedPrimitive, ParsedString, ParsedBoolean, ParsedNumber
} from "./parser"

type Reducers = {
  function: (name: string, params: unknown[]) => unknown,
  primitive: (value: string | boolean | number) => unknown,
  reference: (identifier: string, subPaths: string[]) => unknown,
  arithmetic: (left: unknown, operator: string, right: unknown) => unknown,
}

export function createResolver<T>(reducers: Reducers) {
  const resolvePrimitive = (value: ParsedPrimitive) => {
    const isString = isGrammarType<ParsedString>(value, 'string')
    const isBoolean = isGrammarType<ParsedBoolean>(value, 'boolean')
    const isNumber = isGrammarType<ParsedNumber>(value, 'number')

    if (isString || isBoolean || isNumber) {
      return reducers.primitive(value.value)
    }

    return null
  }

  const resolveFunction = (parsedFunction: ParsedFunction): T | undefined => {
    const { name, params } = parsedFunction.value

    const resolvedParams = params.map(param => {
      return resolveBranch(param)
    })

    return reducers.function(name, resolvedParams) as T
  }

  const resolveArithmetic = (arithmetic: ParsedArithmetic): T | undefined => {
    const left = resolveBranch(arithmetic.value.left)
    const right = resolveBranch(arithmetic.value.right)
    return reducers.arithmetic(left, arithmetic.value.operator.value, right) as T
  }

  const resolveReference = (reference: ParsedReference): T | undefined => {
    return reducers.reference(reference.value.identifier, reference.value.subpath) as T
  }

  const resolveBranch = (branch: ParsedGrammar): T | undefined => {
    if (isGrammarType<ParsedArithmetic>(branch, 'arithmetic')) {
      return resolveArithmetic(branch)
    }

    if (isGrammarType<ParsedFunction>(branch, 'function')) {
      return resolveFunction(branch)
    }

    if (isGrammarType<ParsedReference>(branch, 'reference')) {
      return resolveReference(branch)
    }

    if (isPrimitive(branch)) {
      return resolvePrimitive(branch) as T
    }
  }

  return (formula: ParsedFormula) => {
    return resolveBranch(formula.value)
  }
}
