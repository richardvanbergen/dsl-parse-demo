// @ts-expect-error no types
import moo from "moo"

const lexer = moo.compile({
  WS:        /[ \t]+/,
  number:    /-?\d+\.?\d*/,
  string: [
    // @ts-expect-error no types
    { match: /"""[^]*?"""/, lineBreaks: true, value: x => x.slice(3, -3) },
    // @ts-expect-error no types
    { match: /"(?:\\["\\rn]|[^"\\])*?"/, lineBreaks: true, value: x => x.slice(1, -1) },
    // @ts-expect-error no types
    { match: /'(?:\\['\\rn]|[^'\\])*?'/, lineBreaks: true, value: x => x.slice(1, -1) },
  ],
  reference:  /\$[a-zA-Z_]{1}[a-zA-Z\d_]*(?:(?:\.[a-zA-Z_]{1}[a-zA-z\d_]*)|(?:\[\d+\]))*/,
  formula:    '=',
  plus:       '+',
  minus:      '-',
  times:      '*',
  divide:     '/',
  exponent:   '^',
  dot:        '.',
  lparen:     '(',
  rparen:     ')',
  separator:  ',',
  boolean:    ['true', 'false'],
  identifier: /[a-zA-Z][a-zA-Z_0-9]*/,
  NL:         { match: /\n/, lineBreaks: true },
})

export default lexer
