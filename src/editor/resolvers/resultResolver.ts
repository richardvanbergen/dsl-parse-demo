import { createResolver } from "../resolve";
import get from "lodash/get";
import {divide, multiply, pow, subtract, sum} from "mathjs";
import { toResolvers, registeredFunctions } from '../functions'

const functions = toResolvers(registeredFunctions)

// parser should ensure that left and right are both resolvable to a number
// if not then this will throw an error as we have bad input
type OperationFn = (x: unknown, y: unknown) => number

const getOperationFunction = (operation: string) => {
  if (operation === '+') {
    return sum as OperationFn
  }

  if (operation === '-') {
    return subtract as OperationFn
  }

  if (operation === '*') {
    return multiply as OperationFn
  }

  if (operation === '/') {
    return divide as OperationFn
  }

  if (operation === '^') {
    return pow as OperationFn
  }
}

export class ArithmeticError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class ComparisonError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class FunctionError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export const createResultResolver = (inputValues: Record<string, unknown>) => {
  return createResolver<unknown>({
    function: (name, params) => {
      const toRun = functions.get(name)

      if (toRun) {
        return toRun(params)
      } else {
        throw new FunctionError(`Function ${name} not found.`)
      }
    },
    arithmetic: (left, operator, right) => {
      const operationFn = getOperationFunction(operator)

      if (typeof left !== 'undefined' && isNaN(left)) {
        throw new ArithmeticError(`Invalid arithmetic operation. Left side of operation is not a number.`)
      }

      if (typeof right !== 'undefined' && isNaN(right)) {
        throw new ArithmeticError(`Invalid arithmetic operation. Right side of operation is not a number.`)
      }

      if (operationFn) {
        return operationFn(left, right)
      }
    },
    scopedReference: (path: string[], context?: unknown) => {
      if (path.length === 0) {
        return context
      }

      return get(context, path)
    },
    comparison: (a, operator, b) => {
      if (operator.type === 'equals') {
        return a === b
      }

      if (operator.type === 'not_equals') {
        return a !== b
      }

      const numberA = a as number
      const numberB = b as number

      if (isNaN(numberA)) {
        throw new ComparisonError(`Invalid comparison operation. Left side of operation is not a number.`)
      }

      if (isNaN(numberB)) {
        throw new ComparisonError(`Invalid comparison operation. Right side of operation is not a number.`)
      }

      if (operator.type === 'lt') {
        return numberA < numberB
      }

      if (operator.type === 'lte') {
        return numberA <= numberB
      }

      if (operator.type === 'gt') {
        return numberA > numberB
      }

      if (operator.type === 'gte') {
        return numberA >= numberB
      }

      throw new ComparisonError(`Invalid comparison operation.`)
    },
    boolean: (value) => value,
    primitive: (value) => value,
    reference: (identifier, subPaths) => {
      let combine = [identifier]
      if (subPaths && subPaths.length > 0) {
        combine = [...combine, ...subPaths]
      }

      return get(inputValues, combine)
    },
  })
}
