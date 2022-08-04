import {
  isGrammarType,
  isPrimitive,
} from "./parser"

import type {
  ParsedFormula,
  ParsedGrammar,
  ParsedArithmetic,
  ParsedFunction,
  ParsedReference,
  ParsedPrimitive,
  ParsedString,
  ParsedBoolean,
  ParsedNumber, ParsedComparison
} from './grammarTypes'

export type ResolvedValue = {
  value: unknown,
  error?: string
}

export type Inputs = {
  input: Map<string, ResolvedValue>
  values: Map<string, ResolvedValue>
}

type Reducers = {
  function: (name: string, params: unknown[]) => unknown,
  primitive: (value: string | boolean | number) => unknown,
  boolean: (value: string | boolean | number) => unknown,
  reference: (identifier: string, subPaths: string[]) => unknown,
  comparison: (a: unknown, b: unknown) => unknown,
  arithmetic: (left: number | undefined, operator: string, right: number | undefined) => unknown,
}

export function createResolver<T>(reducers: Reducers) {
  const resolvePrimitive = (value: ParsedPrimitive) => {
    const isString = isGrammarType<ParsedString>(value, 'string')
    const isNumber = isGrammarType<ParsedNumber>(value, 'number')

    if (isString || isNumber) {
      return reducers.primitive(value.value)
    }

    return null
  }

  const resolveBoolean = (value: ParsedBoolean): T | undefined => {
    return reducers.boolean(value.value) as T
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
    return reducers.arithmetic(left as any, arithmetic.value.operator.value, right as any) as T
  }

  const resolveComparison = (arithmetic: ParsedComparison): T | undefined => {
    const a = resolveBranch(arithmetic.value.a)
    const b = resolveBranch(arithmetic.value.b)
    return reducers.comparison(a as any, b as any) as T
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

    if (isGrammarType<ParsedBoolean>(branch, 'boolean')) {
      return resolveBoolean(branch)
    }

    if (isGrammarType<ParsedComparison>(branch, 'comparison')) {
      return resolveComparison(branch)
    }

    if (isPrimitive(branch)) {
      return resolvePrimitive(branch) as T
    }
  }

  return (formula: ParsedFormula) => {
    return resolveBranch(formula.value)
  }
}
