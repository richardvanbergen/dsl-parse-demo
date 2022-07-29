import {
  parse,
  ParsedArithmetic,
  ParsedBoolean,
  ParsedFormula,
  ParsedFunction,
  ParsedNumber,
  ParsedOperator,
  ParsedReference,
  ParsedString
} from "./parser"

import { assert, expect, test } from 'vitest'


test("parse false", () => {
  const result = parse("=false") as ParsedFormula[]
  const formula = result?.[0] as ParsedFormula
  const value = formula.value as ParsedBoolean

  assert.deepEqual(formula.type, "formula")
  assert.deepEqual(value.type, "boolean")
  assert.deepEqual(value.value, false)
})

test("parse true", () => {
  const result = parse("=true") as ParsedFormula[]
  const formula = result?.[0] as ParsedFormula
  const value = formula.value as ParsedBoolean

  assert.deepEqual(formula.type, "formula")
  assert.deepEqual(value.type, "boolean")
  assert.deepEqual(value.value, true)
})

test("parse numbers", () => {
  const zero = parse("=0")?.[0] as ParsedFormula
  const zValue = zero.value as ParsedNumber
  const decimal = parse("=0.123")?.[0] as ParsedFormula
  const dValue = decimal.value as ParsedNumber
  const minus = parse("=-1")?.[0] as ParsedFormula
  const mValue = minus.value as ParsedNumber
  const big = parse("=1232893434")?.[0] as ParsedFormula
  const bValue = big.value as ParsedNumber

  assert.deepEqual(zValue.type, "number")
  assert.deepEqual(zValue.value, 0)
  assert.deepEqual(dValue.type, "number")
  assert.deepEqual(dValue.value, 0.123)
  assert.deepEqual(mValue.type, "number")
  assert.deepEqual(mValue.value, -1)
  assert.deepEqual(bValue.type, "number")
  assert.deepEqual(bValue.value, 1232893434)
})

test("multiplication order", () => {
  const result = parse("=1 - 2 * 3")?.[0] as ParsedFormula
  const value = result.value as ParsedArithmetic
  const left = value.operation.left as ParsedNumber
  const right = value.operation.right as ParsedArithmetic
  const left2 = right.operation.left as ParsedNumber
  const right2 = right.operation.right as ParsedNumber

  assert.deepEqual(left.value, 1)
  assert.deepEqual(value.operation.operator.value, "-")
  assert.deepEqual(left2.value, 2)
  assert.deepEqual(right.operation.operator.value, "*")
  assert.deepEqual(right2.value, 3)
})

test("division order", () => {
  const result = parse("=1 + 2 - 3 / 4")?.[0] as ParsedFormula
  const value = result.value as ParsedArithmetic
  const left = value.operation.left as ParsedArithmetic
  const operator = value.operation.operator
  const right = value.operation.right as ParsedArithmetic

  const left1 = left.operation.left as ParsedNumber
  const operator1 = left.operation.operator
  const right1 = left.operation.right as ParsedNumber

  const left2 = right.operation.left as ParsedNumber
  const operator2 = right.operation.operator
  const right2 = right.operation.right as ParsedNumber

  assert.deepEqual(left1.value, 1)
  assert.deepEqual(operator1.value, "+")
  assert.deepEqual(right1.value, 2)
  assert.deepEqual(operator.value, "-")
  assert.deepEqual(left2.value, 3)
  assert.deepEqual(operator2.value, '/')
  assert.deepEqual(right2.value, 4)
})

test("parse addition", () => {
  const result = parse("=1 + 2 - 3")?.[0] as ParsedFormula
  const value = result.value as ParsedArithmetic
  const left = value.operation.left as ParsedArithmetic
  const right = value.operation.right as ParsedNumber

  const left2 = left.operation.left as ParsedNumber
  const operator2 = left.operation.operator as ParsedOperator
  const right2 = left.operation.right as ParsedNumber

  assert.deepEqual(left2.value, 1)
  assert.deepEqual(operator2.value, "+")
  assert.deepEqual(right2.value, 2)
  assert.deepEqual(value.operation.operator.value, "-")
  assert.deepEqual(right.value, 3)
})

test("parse parens", () => {
  const result = parse("=1 + (2 - 3)")?.[0] as ParsedFormula
  const value = result.value as ParsedArithmetic
  const left = value.operation.left as ParsedNumber
  const right = value.operation.right as ParsedArithmetic

  const left2 = right.operation.left as ParsedNumber
  const right2 = right.operation.right as ParsedNumber

  assert.deepEqual(left.value, 1)
  assert.deepEqual(value.operation.operator.value, "+")
  assert.deepEqual(left2.value, 2)
  assert.deepEqual(right.operation.operator.value, "-")
  assert.deepEqual(right2.value, 3)
})

test("functions", () => {
  const result = parse("=func()")?.[0] as ParsedFormula
  const value = result.value as ParsedFunction

  assert.deepEqual(value.type, "function")
  assert.deepEqual(value.value.params, [])
})

test("functions with a parameter", () => {
  const result = parse("=func_single(1)")?.[0] as ParsedFormula

  const value = result.value as ParsedFunction
  const number = value.value.params?.[0] as ParsedNumber

  assert.deepEqual(value.type, "function")
  assert.deepEqual(number.value, 1)
})

test("functions with a parameter sum", () => {
  const result = parse("=func(1 + 2)")?.[0] as ParsedFormula
  const value = result.value as ParsedFunction
  const sum = value.value.params?.[0] as ParsedArithmetic
  const left = sum.operation.left as ParsedNumber
  const operator = sum.operation.operator
  const right = sum.operation.right as ParsedNumber

  assert.deepEqual(value.type, "function")
  assert.deepEqual(value.value.name, "func")
  assert.deepEqual(left.value, 1)
  assert.deepEqual(operator.value, '+')
  assert.deepEqual(right.value, 2)
})

test("exponents", () => {
  const result = parse("=1^2")?.[0] as ParsedFormula

  const value = result.value as ParsedArithmetic
  const left = value.operation.left as ParsedNumber
  const operator = value.operation.operator
  const right = value.operation.right as ParsedNumber

  assert.deepEqual(left.value, 1)
  assert.deepEqual(operator.value, '^')
  assert.deepEqual(right.value, 2)
})

test("functions with a nested function as param", () => {
  const result = parse("=func(nested(1))")?.[0] as ParsedFormula
  const value = result.value as ParsedFunction
  const identifier = value.value.params?.[0] as ParsedFunction
  const params = identifier.value.params?.[0] as ParsedNumber

  assert.deepEqual(value.type, "function")
  assert.deepEqual(identifier.value.name, "nested")
  assert.deepEqual(params.value, 1)
})

test("functions with multiple params", () => {
  const result = parse("=func_multiple(1, 2, 3)")?.[0] as ParsedFormula
  const value = result.value as ParsedFunction
  assert.deepEqual(value.type, "function")
  assert.deepEqual(value.value.params.length, 3)
  assert.deepEqual(value.value.name, "func_multiple")
  assert.deepEqual((value.value.params[0] as ParsedNumber).value, 1)
  assert.deepEqual((value.value.params[1] as ParsedNumber).value, 2)
  assert.deepEqual((value.value.params[2] as ParsedNumber).value, 3)
})

test("functions with strings", () => {
  const result = parse("=func_multiple(\"param1\", 'param2')")?.[0] as ParsedFormula
  const value = result.value as ParsedFunction
  assert.deepEqual(value.type, "function")
  assert.deepEqual(value.value.params.length, 2)
  assert.deepEqual(value.value.name, "func_multiple")
  assert.deepEqual((value.value.params[0] as ParsedString).value, "param1")
  assert.deepEqual((value.value.params[1] as ParsedString).value, "param2")

  expect(() => parse("=func_multiple(\"param1')")).toThrow()
  expect(() => parse("=func_multiple('param1\")")).toThrow()
})

test("functions with boolean params", () => {
  const result = parse("=func_bool(true, false)")?.[0] as ParsedFormula
  const value = result.value as ParsedFunction
  assert.deepEqual(value.type, "function")
  assert.deepEqual(value.value.params.length, 2)
  assert.deepEqual(value.value.name, "func_bool")
  assert.deepEqual((value.value.params[0] as ParsedBoolean).value, true)
  assert.deepEqual((value.value.params[1] as ParsedBoolean).value, false)
})

test("functions with the kitchen sink thrown at it", () => {
  const result = parse("=func_party(nest1(100), 2, 4 / 2, nest2(42, 69, 'nice'), 'string', true)")?.[0] as ParsedFormula
  const parsedFunction = result.value as ParsedFunction
  const [
    nest1,
    param2,
    param3,
    param4,
    param5,
    param6
  ] = parsedFunction.value.params as [ParsedFunction, ParsedNumber, ParsedArithmetic, ParsedFunction, ParsedString, ParsedBoolean]

  const left = param3.operation.left as ParsedNumber
  const right = param3.operation.right as ParsedNumber

  const [
    number1,
    number2,
    string3
  ] = param4.value.params as [ParsedNumber, ParsedNumber, ParsedString]

  assert.deepEqual(parsedFunction.type, "function")
  assert.deepEqual(nest1.value.name, "nest1")
  assert.deepEqual((nest1.value.params[0] as ParsedNumber).value, 100)
  assert.deepEqual(param2.value, 2)
  assert.deepEqual(left.value, 4)
  assert.deepEqual(param3.operation.operator.value, "/")
  assert.deepEqual(right.value, 2)

  assert.deepEqual(param4.value.name, "nest2")
  assert.deepEqual(number1.value, 42)
  assert.deepEqual(number2.value, 69)
  assert.deepEqual(string3.value, 'nice')

  assert.deepEqual(param5.value, 'string')
  assert.deepEqual(param6.value, true)
})

test("functions whitespace test", () => {
  const result = parse(`
      =func_whitespace(
        2
      )
   `)?.[0] as ParsedFormula

  const parsedFunction = result.value as ParsedFunction

  assert.deepEqual(parsedFunction.type, "function")
  assert.deepEqual(parsedFunction.value.name, "func_whitespace")
  assert.deepEqual((parsedFunction.value.params[0] as ParsedNumber).value, 2)
})

test("arithmetic whitespace test", () => {
  const result = parse(`
      =1
      / 4
      + 2
   `)?.[0] as ParsedFormula

  const parsedArithmetic = result.value as ParsedArithmetic
  const { left: leftOperation, operator, right } = parsedArithmetic.operation as { left: ParsedArithmetic, operator: ParsedOperator, right: ParsedNumber }


  assert.deepEqual((leftOperation.operation.left as ParsedNumber).value, 1)
  assert.deepEqual(leftOperation.operation.operator.value, "/")
  assert.deepEqual((leftOperation.operation.right as ParsedNumber).value, 4)

  assert.deepEqual(operator.value, "+")
  assert.deepEqual(right.value, 2)
})

test("references", () => {
  const result = parse(`
      =$something
   `)?.[0] as ParsedFormula

  const parsedReference = result.value as ParsedReference

  assert.deepEqual(parsedReference.type, "reference")
  assert.deepEqual(parsedReference.value.identifier, "something")
})

test("references in arithmetic", () => {
  const result = parse(`
      =$something + 1
   `)?.[0] as ParsedFormula

  const parsedReference = result.value as ParsedArithmetic

  assert.deepEqual(parsedReference.type, "arithmetic")
  assert.deepEqual(parsedReference.operation.left.type, "reference")
  assert.deepEqual((parsedReference.operation.left as ParsedReference).value.identifier, "something")
  assert.deepEqual(parsedReference.operation.operator.value, "+")
  assert.deepEqual((parsedReference.operation.right as ParsedNumber).value, 1)
})

test("references with sub identifiers", () => {
  const result1 = parse(`=$something.test`)?.[0] as ParsedFormula
  const result2 = parse(`=$something.test.hello`)?.[0] as ParsedFormula

  const parsedReference1 = result1.value as ParsedReference
  const parsedReference2 = result2.value as ParsedReference

  assert.deepEqual(parsedReference1.type, "reference")
  assert.deepEqual(parsedReference1.value.identifier, "something")
  assert.deepEqual(parsedReference1.value.subpath, ["test"])

  assert.deepEqual(parsedReference2.type, "reference")
  assert.deepEqual(parsedReference2.value.identifier, "something")
  assert.deepEqual(parsedReference2.value.subpath, ["test", "hello"])
})

test("references with array keys", () => {
  const result1 = parse(`=$something[0].test[123]`)?.[0] as ParsedFormula
  const result2 = parse(`=$id.test[2].hello[12]`)?.[0] as ParsedFormula

  const parsedReference1 = result1.value as ParsedReference
  const parsedReference2 = result2.value as ParsedReference

  assert.deepEqual(parsedReference1.type, "reference")
  assert.deepEqual(parsedReference1.value.identifier, "something")
  assert.deepEqual(parsedReference1.value.subpath, ['0', 'test', '123'])

  assert.deepEqual(parsedReference2.type, "reference")
  assert.deepEqual(parsedReference2.value.identifier, "id")
  assert.deepEqual(parsedReference2.value.subpath, ['test', '2', 'hello', "12"])
})

test("throw errors with invalid names", () => {
  expect(() => parse(`=$2`)).toThrow()
  expect(() => parse(`=$s.7st`)).toThrow()
  expect(() => parse(`=$s.2test`)).toThrow()
  expect(() => parse(`=$_.te%t`)).toThrow()
  expect(() => parse(`=$s.test.8`)).toThrow()
})
