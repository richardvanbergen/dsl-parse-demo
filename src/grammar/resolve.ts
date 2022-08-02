import {
  isGrammarType,
  isPrimitive,
  ParsedFormula,
  ParsedGrammar,
  ParsedArithmetic,
  ParsedOperator,
  ParsedFunction, ParsedReference
} from "./parser"

import { sum, divide, multiply, subtract, pow } from 'mathjs'
import get from "lodash/get";

export type ResolvedBranch = {
  formula: string | null,
  result: unknown | null
}

export function createResolver(functions: Map<string, (value: unknown[]) => unknown>) {
  const resolvePrimitive = (value: ParsedGrammar): ResolvedBranch => {
    return {
      formula: value.value as string,
      result: value.value,
    }
  }

  // parser should ensure that left and right are both resolvable to a number
  // if not then this will throw an error as we have bad input
  type OperationFn = (x: unknown, y: unknown) => number

  const getOperationFunction = (operation: ParsedOperator) => {
    if (operation.value === '+') {
      return sum as OperationFn
    }

    if (operation.value === '-') {
      return subtract as OperationFn
    }

    if (operation.value === '*') {
      return multiply as OperationFn
    }

    if (operation.value === '/') {
      return divide as OperationFn
    }

    if (operation.value === '^') {
      return pow as OperationFn
    }
  }

  const resolveFunction = (parsedFunction: ParsedFunction, inputs: Record<string, unknown>): ResolvedBranch => {
    const { name, params } = parsedFunction.value
    const toRun = functions.get(name)

    if (toRun) {
      const values = params.map(param => {
        return resolveBranch(param, inputs)
      })

      return {
        formula: `${name}(${values.map(value => value.formula).join(', ')})`,
        result: toRun(values.map(value => value.result))
      }
    }

    throw new Error(`Function ${name} not found.`)
  }

  const resolveArithmetic = (arithmetic: ParsedArithmetic, input: Record<string, unknown>): ResolvedBranch => {
    const left = resolveBranch(arithmetic.value.left, input)
    const right = resolveBranch(arithmetic.value.right, input)

    const operationFn = getOperationFunction(arithmetic.value.operator)

    if (operationFn) {
      return {
        formula: `(${left.result} ${arithmetic.value.operator} ${right.result})`,
        result: operationFn(left.result, right.result),
      }
    }

    return {
      formula: null,
      result: null,
    }
  }

  const resolveReference = (reference: ParsedReference, input: Record<string, unknown>): ResolvedBranch => {
    let combine = [reference.value.identifier]
    if (reference.value.subpath && reference.value.subpath.length > 0) {
      combine = [...combine, ...reference.value.subpath]
    }

    const value = get(input, combine)
    if (value) {
      return {
        formula: value,
        result: value,
      }
    }

    return {
      formula: null,
      result: null,
    }
  }

  const resolveBranch = (branch: ParsedGrammar, input: Record<string, unknown>): ResolvedBranch => {
    if (isGrammarType<ParsedArithmetic>(branch, 'arithmetic')) {
      return resolveArithmetic(branch, input)
    }

    if (isGrammarType<ParsedFunction>(branch, 'function')) {
      return resolveFunction(branch, input)
    }

    if (isGrammarType<ParsedReference>(branch, 'reference')) {
      return resolveReference(branch, input)
    }

    if (isPrimitive(branch)) {
      return resolvePrimitive(branch)
    }

    return {
      formula: '',
      result: undefined,
    }
  }

  return (formula: ParsedFormula, input: Record<string, unknown>) => {
    return resolveBranch(formula.value, input)
  }
}
