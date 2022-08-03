import {createResolver} from "../resolve";
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

export class FunctionError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export const createResultResolver = (inputValues: { input: Record<string, unknown> }) => {
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

      if (!left) {
        throw new ArithmeticError(`Invalid arithmetic operation. Left side of operation is undefined.`)
      }

      if (!right) {
        throw new ArithmeticError(`Invalid arithmetic operation. Right side of operation is undefined.`)
      }

      if (isNaN(left) || isNaN(right)) {
        throw new ArithmeticError(`Invalid arithmetic operation: ${left} ${operator} ${right}`)
      }

      if (operationFn && left && right) {
        return operationFn(left, right)
      }
    },
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
