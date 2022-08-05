import { expect, test } from 'vitest'
import lexer from "./lexer"

test("can lex booleans", () =>
{
  const trueBool = lexer.reset("true").next()
  expect(trueBool?.text).toBe("true")
  expect(trueBool?.type).toBe("boolean")

  const falseBool = lexer.reset("false").next()
  expect(falseBool?.text).toBe("false")

  expect(falseBool?.type).toBe("boolean")
})

test("can lex a formula", () => {
  const result = lexer.reset(`=`).next()
  expect(result?.type).toBe('formula')
})

test("can whitespace", () => {
  const result = lexer.reset(` `).next()
  expect(result?.type).toBe('ws')
})

test("can newline", () => {
  const result = lexer.reset(`
  `).next()
  expect(result?.type).toBe('ws')
})

test("can match numbers", () => {
  const int = lexer.reset(`123`).next()
  expect(int?.type).toBe('number')

  const zero = lexer.reset(`123`).next()
  expect(zero?.type).toBe('number')

  const decimal = lexer.reset(`123.4`).next()
  expect(decimal?.type).toBe('number')

  const decimalMinus = lexer.reset(`-123.4`).next()
  expect(decimalMinus?.type).toBe('number')

  const zeroSingleDigit = lexer.reset(`0`).next()
  expect(zeroSingleDigit?.type).toBe('number')

  const zeroWithMinusOperator = lexer.reset(`-0`).next()
  expect(zeroWithMinusOperator?.type).toBe('number')

  const minusOne = lexer.reset(`-1`).next()
  expect(minusOne?.type).toBe('number')

  const oneSingleDigit = lexer.reset(`1`).next()
  expect(oneSingleDigit?.type).toBe('number')
})

test("can match addition", () => {
  const result = lexer.reset(`+`).next()
  expect(result?.type).toBe('plus')
})

test("can match subtraction", () => {
  const result = lexer.reset(`-`).next()
  expect(result?.type).toBe('minus')
})

test("can match multiplication", () => {
  const result = lexer.reset(`*`).next()
  expect(result?.type).toBe('times')
})

test("can match division", () => {
  const result = lexer.reset(`/`).next()
  expect(result?.type).toBe('divide')
})

test("can match identifier", () => {
  const result = lexer.reset(`FuNcTiOn`).next()
  expect(result?.type).toBe('identifier')
})

test("can match comparison", () => {
  const result = lexer.reset(`==`).next()
  expect(result?.type).toBe('equals')
})

test("can match not comparison", () => {
  const result = lexer.reset(`!=`).next()
  expect(result?.type).toBe('not_equals')
})

test("can match less than", () => {
  const result = lexer.reset(`<`).next()
  expect(result?.type).toBe('lt')
})

test("can match greater than", () => {
  const result = lexer.reset(`>`).next()
  expect(result?.type).toBe('gt')
})

test("can match less than or equal to", () => {
  const result = lexer.reset(`<=`).next()
  expect(result?.type).toBe('lte')
})

test("can match greater than or equal to", () => {
  const result = lexer.reset(`>=`).next()
  expect(result?.type).toBe('gte')
})

test("can match each", () => {
  const result = lexer.reset(`each`).next()
  expect(result?.type).toBe('each')
})

test("can match select from", () => {
  const result = lexer.reset(`select`).next()
  expect(result?.type).toBe('select')
})

test("can match rows", () => {
  expect(lexer.reset(`row`).next()?.type).toBe('scoped_reference')
  expect(lexer.reset(`row.test`).next()?.type).toBe('scoped_reference')
  expect(lexer.reset(`row.test.test`).next()?.type).toBe('scoped_reference')
})

test("can match references", () => {
  expect(lexer.reset(`$input`).next()?.type).toBe('reference')
  expect(lexer.reset(`$input.test`).next()?.type).toBe('reference')
  expect(lexer.reset(`$input.test.test`).next()?.type).toBe('reference')
})

