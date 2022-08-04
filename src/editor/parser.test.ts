import {
  parse,
} from "./parser"

import {
  flatten
} from './ast'

import {
  ParsedArithmetic,
  ParsedBoolean, ParsedComparison,
  ParsedFormula,
  ParsedFunction,
  ParsedNumber,
  ParsedOperator,
  ParsedReference,
  ParsedString
} from "./grammarTypes"

import { expect, test } from 'vitest'

test("parse false", () => {
  const result = parse("=false") as ParsedFormula
  const formula = result as ParsedFormula
  const value = formula.value as ParsedBoolean

  expect(formula.type).toBe("formula")
  expect(value.type).toBe("boolean")
  expect(value.value).toBe(false)
})

test("parse true", () => {
  const result = parse("=true") as ParsedFormula
  const formula = result as ParsedFormula
  const value = formula.value as ParsedBoolean

  expect(formula.type).toBe("formula")
  expect(value.type).toBe("boolean")
  expect(value.value).toBe(true)
})

test("parse numbers", () => {
  const zero = parse("=0") as ParsedFormula
  const zValue = zero.value as ParsedNumber
  const decimal = parse("=0.123") as ParsedFormula
  const dValue = decimal.value as ParsedNumber
  const minus = parse("=-1") as ParsedFormula
  const mValue = minus.value as ParsedNumber
  const big = parse("=1232893434") as ParsedFormula
  const bValue = big.value as ParsedNumber

  expect(zValue.type).toBe("number")
  expect(zValue.value).toBe(0)
  expect(dValue.type).toBe("number")
  expect(dValue.value).toBe(0.123)
  expect(mValue.type).toBe("number")
  expect(mValue.value).toBe(-1)
  expect(bValue.type).toBe("number")
  expect(bValue.value).toBe(1232893434)
})

test("basic arithmetic", () => {
  const result = parse("=1 + 1") as ParsedFormula

  const arithmetic = result.value as ParsedArithmetic
  const left = arithmetic.value.left as ParsedNumber
  const operator = arithmetic.value.operator
  const right = arithmetic.value.right as ParsedArithmetic

  expect(left.value).toBe(1)
  expect(operator.value).toBe("+")
  expect(right.value).toBe(1)
})

test("multiplication order", () => {
  const result = parse("=1 - 2 * 3") as ParsedFormula
  const arithmetic = result.value as ParsedArithmetic
  const left = arithmetic.value.left as ParsedNumber
  const right = arithmetic.value.right as ParsedArithmetic
  const left2 = right.value.left as ParsedNumber
  const right2 = right.value.right as ParsedNumber

  expect(left.value).toBe(1)
  expect(arithmetic.value.operator.value).toBe("-")
  expect(left2.value).toBe(2)
  expect(right.value.operator.value).toBe("*")
  expect(right2.value).toBe(3)
})

test("division order", () => {
  const result = parse("=1 + 2 - 3 / 4") as ParsedFormula
  const arithmetic = result.value as ParsedArithmetic
  const left = arithmetic.value.left as ParsedArithmetic
  const operator = arithmetic.value.operator
  const right = arithmetic.value.right as ParsedArithmetic

  const left1 = left.value.left as ParsedNumber
  const operator1 = left.value.operator
  const right1 = left.value.right as ParsedNumber

  const left2 = right.value.left as ParsedNumber
  const operator2 = right.value.operator
  const right2 = right.value.right as ParsedNumber

  expect(left1.value).toBe(1)
  expect(operator1.value).toBe("+")
  expect(right1.value).toBe(2)
  expect(operator.value).toBe("-")
  expect(left2.value).toBe(3)
  expect(operator2.value).toBe('/')
  expect(right2.value).toBe(4)
})

test("parse addition", () => {
  const result = parse("=1 + 2 - 3") as ParsedFormula
  const arithmetic = result.value as ParsedArithmetic
  const left = arithmetic.value.left as ParsedArithmetic
  const right = arithmetic.value.right as ParsedNumber

  const left2 = left.value.left as ParsedNumber
  const operator2 = left.value.operator as ParsedOperator
  const right2 = left.value.right as ParsedNumber

  expect(left2.value).toBe(1)
  expect(operator2.value).toBe("+")
  expect(right2.value).toBe(2)
  expect(arithmetic.value.operator.value).toBe("-")
  expect(right.value).toBe(3)
})

test("parse parens", () => {
  const result = parse("=1 + (2 - 3)") as ParsedFormula
  const arithmetic = result.value as ParsedArithmetic
  const left = arithmetic.value.left as ParsedNumber
  const right = arithmetic.value.right as ParsedArithmetic

  const left2 = right.value.left as ParsedNumber
  const right2 = right.value.right as ParsedNumber

  expect(left.value).toBe(1)
  expect(arithmetic.value.operator.value).toBe("+")
  expect(left2.value).toBe(2)
  expect(right.value.operator.value).toBe("-")
  expect(right2.value).toBe(3)
})

test("functions", () => {
  const result = parse("=func()") as ParsedFormula
  const value = result.value as ParsedFunction

  expect(value.type).toBe("function")
  expect(value.value.params).toStrictEqual([])
})

test("functions with a parameter", () => {
  const result = parse("=func_single(1)") as ParsedFormula

  const value = result.value as ParsedFunction
  const number = value.value.params?.[0] as ParsedNumber

  expect(value.type).toBe("function")
  expect(number.value).toBe(1)
})

test("functions with a parameter sum", () => {
  const result = parse("=func(1 + 2)") as ParsedFormula
  const arithmetic = result.value as ParsedFunction
  const sum = arithmetic.value.params?.[0] as ParsedArithmetic
  const left = sum.value.left as ParsedNumber
  const operator = sum.value.operator
  const right = sum.value.right as ParsedNumber

  expect(arithmetic.type).toBe("function")
  expect(arithmetic.value.name).toBe("func")
  expect(left.value).toBe(1)
  expect(operator.value).toBe('+')
  expect(right.value).toBe(2)
})

test("exponents", () => {
  const result = parse("=1^2") as ParsedFormula

  const arithmetic = result.value as ParsedArithmetic
  const left = arithmetic.value.left as ParsedNumber
  const operator = arithmetic.value.operator
  const right = arithmetic.value.right as ParsedNumber

  expect(left.value).toBe(1)
  expect(operator.value).toBe('^')
  expect(right.value).toBe(2)
})

test("functions with a nested function as param", () => {
  const result = parse("=func(nested(1))") as ParsedFormula
  const value = result.value as ParsedFunction
  const identifier = value.value.params?.[0] as ParsedFunction
  const params = identifier.value.params?.[0] as ParsedNumber

  expect(value.type).toBe("function")
  expect(identifier.value.name).toBe("nested")
  expect(params.value).toBe(1)
})

test("functions with multiple params", () => {
  const result = parse("=func_multiple(1, 2, 3)") as ParsedFormula
  const value = result.value as ParsedFunction

  expect(value.type).toBe("function")
  expect(value.value.params.length).toBe(3)
  expect(value.value.name).toBe("func_multiple")
  expect((value.value.params[0] as ParsedNumber).value).toBe(1)
  expect((value.value.params[1] as ParsedNumber).value).toBe(2)
  expect((value.value.params[2] as ParsedNumber).value).toBe(3)
})

test("functions with strings", () => {
  const result = parse('=func_multiple("param1", "param2")') as ParsedFormula
  const value = result.value as ParsedFunction

  expect(value.type).toBe("function")
  expect(value.value.params.length).toBe(2)
  expect(value.value.name).toBe("func_multiple")
  expect((value.value.params[0] as ParsedString).value).toBe("param1")
  expect((value.value.params[1] as ParsedString).value).toBe("param2")
})

test("functions with strings and spaces in them", () => {
  const result = parse('=func_multiple("test me")') as ParsedFormula
  const value = result.value as ParsedFunction

  expect(value.type).toBe("function")
  expect(value.value.params.length).toBe(1)
  expect(value.value.name).toBe("func_multiple")
  expect((value.value.params[0] as ParsedString).value).toBe("test me")
})

test("functions with single quotes", () => {
  const result = parse(`=func_multiple('test me')`) as ParsedFormula
  const value = result.value as ParsedFunction

  expect(value.type).toBe("function")
  expect(value.value.params.length).toBe(1)
  expect(value.value.name).toBe("func_multiple")
  expect((value.value.params[0] as ParsedString).value).toBe("test me")
})

test("disallow mixed quotes", () => {
  expect(() => parse(`=func_multiple('test me")`)).toThrowError()
  expect(() => parse(`=func_multiple("test me')`)).toThrowError()
})

test("functions with boolean params", () => {
  const result = parse("=func_bool(true, false)") as ParsedFormula
  const value = result.value as ParsedFunction
  expect(value.type).toBe("function")
  expect(value.value.params.length).toBe(2)
  expect(value.value.name).toBe("func_bool")
  expect((value.value.params[0] as ParsedBoolean).value).toBe(true)
  expect((value.value.params[1] as ParsedBoolean).value).toBe(false)
})

test("functions with the kitchen sink thrown at it", () => {
  const result = parse('=func_party(nest1(100), 2, 4 / 2, nest2(42, 69, "nice"), "string", true)') as ParsedFormula
  const parsedFunction = result.value as ParsedFunction
  const [
    nest1,
    param2,
    param3,
    param4,
    param5,
    param6
  ] = parsedFunction.value.params as [ParsedFunction, ParsedNumber, ParsedArithmetic, ParsedFunction, ParsedString, ParsedBoolean]

  const left = param3.value.left as ParsedNumber
  const right = param3.value.right as ParsedNumber

  const [
    number1,
    number2,
    string3
  ] = param4.value.params as [ParsedNumber, ParsedNumber, ParsedString]

  expect(parsedFunction.type).toBe("function")
  expect(nest1.value.name).toBe("nest1")
  expect((nest1.value.params[0] as ParsedNumber).value).toBe(100)
  expect(param2.value).toBe(2)
  expect(left.value).toBe(4)
  expect(param3.value.operator.value).toBe("/")
  expect(right.value).toBe(2)

  expect(param4.value.name).toBe("nest2")
  expect(number1.value).toBe(42)
  expect(number2.value).toBe(69)
  expect(string3.value).toBe('nice')

  expect(param5.value).toBe('string')
  expect(param6.value).toBe(true)
})

test("functions whitespace test", () => {
  const result = parse(`
      =func_whitespace(
        2
      )
   `) as ParsedFormula

  const parsedFunction = result.value as ParsedFunction

  expect(parsedFunction.type).toBe("function")
  expect(parsedFunction.value.name).toBe("func_whitespace")
  expect((parsedFunction.value.params[0] as ParsedNumber).value).toBe(2)
})

test("arithmetic whitespace test", () => {
  const result = parse(`
      =1
      / 4
      + 2
   `) as ParsedFormula

  const parsedArithmetic = result.value as ParsedArithmetic
  const { left: leftOperation, operator, right } = parsedArithmetic.value as { left: ParsedArithmetic, operator: ParsedOperator, right: ParsedNumber }

  expect((leftOperation.value.left as ParsedNumber).value).toBe(1)
  expect(leftOperation.value.operator.value).toBe("/")
  expect((leftOperation.value.right as ParsedNumber).value).toBe(4)

  expect(operator.value).toBe("+")
  expect(right.value).toBe(2)
})

test("references", () => {
  const result = parse(`
      =$something
   `) as ParsedFormula

  const parsedReference = result.value as ParsedReference

  expect(parsedReference.type).toBe("reference")
  expect(parsedReference.value.identifier).toBe("something")
})

test("references in arithmetic", () => {
  const result = parse(`
      =$something + 1
   `) as ParsedFormula

  const parsedReference = result.value as ParsedArithmetic

  expect(parsedReference.type).toBe("arithmetic")
  expect(parsedReference.value.left.type).toBe("reference")
  expect((parsedReference.value.left as ParsedReference).value.identifier).toBe("something")
  expect(parsedReference.value.operator.value).toBe("+")
  expect((parsedReference.value.right as ParsedNumber).value).toBe(1)
})

test("references with sub identifiers", () => {
  const result1 = parse(`=$something.test`) as ParsedFormula
  const result2 = parse(`=$something.test.hello`) as ParsedFormula

  const parsedReference1 = result1.value as ParsedReference
  const parsedReference2 = result2.value as ParsedReference

  expect(parsedReference1.type).toBe("reference")
  expect(parsedReference1.value.identifier).toBe("something")
  expect(parsedReference1.value.subpath).toStrictEqual(["test"])

  expect(parsedReference2.type).toBe("reference")
  expect(parsedReference2.value.identifier).toBe("something")
  expect(parsedReference2.value.subpath).toStrictEqual(["test", "hello"])
})

test("references with array keys", () => {
  const result1 = parse(`=$something[0].test[123]`) as ParsedFormula
  const result2 = parse(`=$id.test[2].hello[12]`) as ParsedFormula

  const parsedReference1 = result1.value as ParsedReference
  const parsedReference2 = result2.value as ParsedReference

  expect(parsedReference1.type).toBe("reference")
  expect(parsedReference1.value.identifier).toBe("something")
  expect(parsedReference1.value.subpath).toStrictEqual(['0', 'test', '123'])

  expect(parsedReference2.type, "reference")
  expect(parsedReference2.value.identifier).toBe("id")
  expect(parsedReference2.value.subpath).toStrictEqual(['test', '2', 'hello', "12"])
})

test("throw errors with invalid names", () => {
  expect(() => parse(`=$2`)).toThrow()
  expect(() => parse(`=$s.7st`)).toThrow()
  expect(() => parse(`=$s.2test`)).toThrow()
  expect(() => parse(`=$_.te%t`)).toThrow()
  expect(() => parse(`=$s.test.8`)).toThrow()
})

test("can make a comparison", () => {
  const ast = parse('=1 == 2') as ParsedFormula

  const comparison = ast.value as ParsedComparison
  const a = comparison.value.a as ParsedNumber
  const b = comparison.value.b as ParsedArithmetic

  expect(a.value).toBe(1)
  expect(b.value).toBe(2)
})

test("can make a comparison in a function parameter", () => {
  const ast = parse('=TEST(1 == 2)') as ParsedFormula

  const func = ast.value as ParsedFunction
  const comparison = func.value.params?.[0] as ParsedComparison
  const a = comparison.value.a as ParsedNumber
  const b = comparison.value.b as ParsedNumber

  expect(a.value).toBe(1)
  expect(b.value).toBe(2)
})

test("can flatten ast", () => {
  const ast = parse('=1 + 2') as ParsedFormula
  const [...flat] = flatten(ast)

  expect((flat[0] as ParsedFormula).type).toBe("formula")
  expect((flat[1] as ParsedArithmetic).type).toBe("arithmetic")
  expect((flat[2] as ParsedNumber).value).toBe(1)
  expect((flat[3] as ParsedOperator).value).toBe("+")
  expect((flat[4] as ParsedNumber).value).toBe(2)
})

test("can flatten more complex ast", () => {
  const ast = parse('=1 + 2 - MAX(4, 5 + $reference.subpath)') as ParsedFormula
  const [...flat] = flatten(ast)

  expect((flat[0] as ParsedFormula).type).toBe("formula")
  expect((flat[1] as ParsedArithmetic).type).toBe("arithmetic")
  expect((flat[2] as ParsedArithmetic).type).toBe("arithmetic")
  expect((flat[3] as ParsedNumber).value).toBe(1)
  expect((flat[4] as ParsedOperator).value).toBe("+")
  expect((flat[5] as ParsedNumber).value).toBe(2)
  expect((flat[6] as ParsedOperator).value).toBe('-')
  expect((flat[7] as ParsedFunction).value.name).toBe('MAX')
  expect((flat[8] as ParsedNumber).value).toBe(4)
  expect((flat[9] as ParsedArithmetic).type).toBe('arithmetic')
  expect((flat[10] as ParsedNumber).value).toBe(5)
  expect((flat[11] as ParsedOperator).value).toBe('+')
  expect((flat[12] as ParsedReference).value.identifier).toBe('reference')
  expect((flat[12] as ParsedReference).value.subpath[0]).toBe('subpath')
  expect((flat[12] as ParsedReference).value.subpath.length).toBe(1)
})

