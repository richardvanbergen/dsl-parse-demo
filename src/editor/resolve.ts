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
  ParsedNumber,
  ParsedComparison,
  ParsedComparator, ParsedScopedReference
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
  scopedReference: (path: string[], context?: unknown) => unknown,
  comparison: (a: unknown, operator: ParsedComparator, b: unknown) => unknown,
  arithmetic: (left: number | undefined, operator: string, right: number | undefined) => unknown,
}

export class EachError extends Error {
  constructor(message: string) {
    super(message)
  }
}

type FormulaContext = { row: unknown }

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

  const resolveArithmetic = (arithmetic: ParsedArithmetic, context?: FormulaContext): T | undefined => {
    const left = resolveBranch(arithmetic.value.left, context)
    const right = resolveBranch(arithmetic.value.right, context)
    return reducers.arithmetic(left as any, arithmetic.value.operator.value, right as any) as T
  }

  const resolveComparison = (comparison: ParsedComparison, context?: FormulaContext): T | undefined => {
    const a = resolveBranch(comparison.value.a, context)
    const b = resolveBranch(comparison.value.b, context)
    return reducers.comparison(a as any, comparison.value.operator, b as any) as T
  }

  const resolveReference = (reference: ParsedReference): T | undefined => {
    return reducers.reference(reference.value.identifier, reference.value.subpath) as T
  }

  const resolveScopedReference = (path: ParsedScopedReference, context?: FormulaContext): T | undefined => {
    return reducers.scopedReference(path.value.subpath ?? [], context?.row) as T
  }

  function resolveBranch (branch: ParsedGrammar, context?: FormulaContext): T | undefined {
    if (isGrammarType<ParsedFormula>(branch, 'formula')) {
      return resolveBranch(branch.value, context)
    }

    if (isGrammarType<ParsedArithmetic>(branch, 'arithmetic')) {
      return resolveArithmetic(branch, context)
    }

    if (isGrammarType<ParsedFunction>(branch, 'function')) {
      return resolveFunction(branch)
    }

    if (isGrammarType<ParsedReference>(branch, 'reference')) {
      return resolveReference(branch)
    }

    if (isGrammarType<ParsedComparison>(branch, 'comparison')) {
      return resolveComparison(branch, context)
    }

    if (isGrammarType<ParsedScopedReference>(branch, 'scoped_reference')) {
      return resolveScopedReference(branch, context)
    }

    if (isGrammarType<ParsedBoolean>(branch, 'boolean')) {
      return resolveBoolean(branch)
    }

    if (isPrimitive(branch)) {
      return resolvePrimitive(branch) as T
    }
  }

  return resolveBranch
}

export function resolveEach(context: ParsedFunction | ParsedReference, body: ParsedGrammar, resolver: (formula: ParsedGrammar, context?: FormulaContext) => unknown) {
  const resolvedContext = resolver(context) as unknown[]

  if (Symbol.iterator in Object(resolvedContext)) {
    const rows = [...resolvedContext]
    return rows.map(context => {
      return resolver(body, { row: context })
    })
  }

  throw new EachError('Each formula must be iterable.')
}
