import { assert, expect, test } from 'vitest'
import lexer from "./lexer"

test("can lex booleans", () =>
{
  const trueBool = lexer.reset("true").next()
  assert.deepEqual(
    trueBool?.text,
    "true"
  )

  assert.deepEqual(
    trueBool?.type,
    "boolean"
  )

  const falseBool = lexer.reset("false").next()
  assert.deepEqual(
    falseBool?.text,
    "false"
  )

  assert.deepEqual(
    falseBool?.type,
    "boolean"
  )
})

test("can lex a formula", () => {
  const result = lexer.reset(`=`).next()
  assert.deepEqual(result?.type, 'formula')
})

test("can match numbers", () => {
  const int = lexer.reset(`123`).next()
  assert.deepEqual(int?.type, 'number')

  const zero = lexer.reset(`123`).next()
  assert.deepEqual(zero?.type, 'number')

  const decimal = lexer.reset(`123.4`).next()
  assert.deepEqual(decimal?.type, 'number')

  const decimalMinus = lexer.reset(`-123.4`).next()
  assert.deepEqual(decimalMinus?.type, 'number')

  const zeroSingleDigit = lexer.reset(`0`).next()
  assert.deepEqual(zeroSingleDigit?.type, 'number')

  const zeroWithMinusOperator = lexer.reset(`-0`).next()
  assert.deepEqual(zeroWithMinusOperator?.type, 'number')

  const minusOne = lexer.reset(`-1`).next()
  assert.deepEqual(minusOne?.type, 'number')

  const oneSingleDigit = lexer.reset(`1`).next()
  assert.deepEqual(oneSingleDigit?.type, 'number')
})

test("can match addition", () => {
  const result = lexer.reset(`+`).next()
  assert.deepEqual(result?.type, 'plus')
})

test("can match subtraction", () => {
  const result = lexer.reset(`-`).next()
  assert.deepEqual(result?.type, 'minus')
})

test("can match multiplication", () => {
  const result = lexer.reset(`*`).next()
  assert.deepEqual(result?.type, 'times')
})

test("can match division", () => {
  const result = lexer.reset(`/`).next()
  assert.deepEqual(result?.type, 'divide')
})

test("can match identifier", () => {
  const result = lexer.reset(`FuNcTiOn`).next()
  assert.deepEqual(result?.type, 'identifier')
})

test("can have strings as either single or double quotes but not mixed", () => {
  const double = lexer.reset(`"my string"`).next()
  assert.deepEqual(double?.type, 'string')
  const single = lexer.reset(`'my string'`).next()
  assert.deepEqual(single?.type, 'string')
  expect(() => lexer.reset(`"my string'`).next()).toThrow(/invalid syntax at line 1 col 1/)
})
