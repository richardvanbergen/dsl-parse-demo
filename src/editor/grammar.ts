// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var ws: any;
declare var formula: any;
declare var plus: any;
declare var minus: any;
declare var times: any;
declare var divide: any;
declare var exponent: any;
declare var number: any;
declare var each: any;
declare var equals: any;
declare var not_equals: any;
declare var lt: any;
declare var lte: any;
declare var gt: any;
declare var gte: any;
declare var reference: any;
declare var scoped_reference: any;
declare var identifier: any;
declare var string: any;
declare var boolean: any;

import lexer from "./lexer"

function arithmeticPost(data: any) {
    return {
        ...data[0],
        type: 'arithmetic',
        value: {
            left: data[0],
            operator: data[2],
            right: data[4],
        }
    }
}

function comparisonPost(data: any) {
    return {
        ...data[0],
        type: 'comparison',
        value: {
            a: data[0],
            operator: data[2],
            b: data[4],
        }
    }
}

function numberPost(data: any) {
    const parsed = data[0]
    if (parsed) {
        parsed.value = Number(parsed.text)
        return parsed
    }
}

function functionPost(data: any) {
    data[0].type = "function"
    const params = data[4]?.[0] ?? []
    data[0].value = {
        name: data[0].text,
        params
    }

    return data[0]
}

function booleanPost(data: any) {
    const parsed = data[0]
    if (parsed) {
        parsed.value = parsed.text === "true"
        return parsed
    }
}

function eachPost(data: any) {
    const parsed = {...data[0]}
    parsed.type = 'each'
    parsed.text = 'each'
    parsed.value = {
        context: data[0],
        body: data[4]
    }
    return parsed
}

function functionParamPost(data: any) {
    const funcParam = Array.isArray(data[4]) ? data[4] : [data[4]]
    return [data[0], ...funcParam]
}

function scopedReferencePost(data: any) {
    const parts = data[0].value.split('.').reduce((acc: string[], cur: string) => {
        const startBracketIndex = cur.indexOf('[')
        const endBracketIndex = cur.indexOf(']')

        if (startBracketIndex !== -1 && endBracketIndex !== -1) {
            const id = cur.slice(0, startBracketIndex)
            const arrIndex = cur.slice(startBracketIndex + 1, endBracketIndex)
            return [...acc, id, arrIndex]
        }

        return [...acc, cur]
    },[])

    const [ identifier, ...subpath ] = parts

    data[0].value = { subpath }
    return data[0]
}

function referencePost(data: any) {
    const [_, value] = data[0].value.split("$")

    const parts = value.split('.').reduce((acc: string[], cur: string) => {
        const startBracketIndex = cur.indexOf('[')
        const endBracketIndex = cur.indexOf(']')

        if (startBracketIndex !== -1 && endBracketIndex !== -1) {
            const id = cur.slice(0, startBracketIndex)
            const arrIndex = cur.slice(startBracketIndex + 1, endBracketIndex)
            return [...acc, id, arrIndex]
        }

        return [...acc, cur]
    },[])

    const [ identifier, ...subpath ] = parts

    data[0].value = { identifier, subpath }
    return data[0]
}

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "main$ebnf$1", "symbols": []},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "main$ebnf$2", "symbols": []},
    {"name": "main$ebnf$2", "symbols": ["main$ebnf$2", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "main", "symbols": ["main$ebnf$1", "value", "main$ebnf$2"], "postprocess": data => data[1]},
    {"name": "value", "symbols": ["formula"]},
    {"name": "formula", "symbols": ["formula_identifier", "each"], "postprocess": data => ({ ...data[0], value: data[1] })},
    {"name": "formula", "symbols": ["formula_identifier", "operation"], "postprocess": data => ({ ...data[0], value: data[1] })},
    {"name": "formula_identifier", "symbols": [(lexer.has("formula") ? {type: "formula"} : formula)], "postprocess": id},
    {"name": "operation", "symbols": ["arithmetic"], "postprocess": id},
    {"name": "operation", "symbols": ["comparison"], "postprocess": id},
    {"name": "operation", "symbols": ["boolean"], "postprocess": id},
    {"name": "operation", "symbols": ["string"], "postprocess": id},
    {"name": "arithmetic", "symbols": ["addition_subtraction"], "postprocess": data => { return data[0] }},
    {"name": "addition_subtraction$ebnf$1", "symbols": []},
    {"name": "addition_subtraction$ebnf$1", "symbols": ["addition_subtraction$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "addition_subtraction$ebnf$2", "symbols": []},
    {"name": "addition_subtraction$ebnf$2", "symbols": ["addition_subtraction$ebnf$2", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "addition_subtraction", "symbols": ["addition_subtraction", "addition_subtraction$ebnf$1", "plus", "addition_subtraction$ebnf$2", "multiplication_division"], "postprocess": arithmeticPost},
    {"name": "addition_subtraction$ebnf$3", "symbols": []},
    {"name": "addition_subtraction$ebnf$3", "symbols": ["addition_subtraction$ebnf$3", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "addition_subtraction$ebnf$4", "symbols": []},
    {"name": "addition_subtraction$ebnf$4", "symbols": ["addition_subtraction$ebnf$4", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "addition_subtraction", "symbols": ["addition_subtraction", "addition_subtraction$ebnf$3", "minus", "addition_subtraction$ebnf$4", "multiplication_division"], "postprocess": arithmeticPost},
    {"name": "addition_subtraction", "symbols": ["multiplication_division"], "postprocess": id},
    {"name": "multiplication_division$ebnf$1", "symbols": []},
    {"name": "multiplication_division$ebnf$1", "symbols": ["multiplication_division$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "multiplication_division$ebnf$2", "symbols": []},
    {"name": "multiplication_division$ebnf$2", "symbols": ["multiplication_division$ebnf$2", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "multiplication_division", "symbols": ["multiplication_division", "multiplication_division$ebnf$1", "times", "multiplication_division$ebnf$2", "exponent"], "postprocess": arithmeticPost},
    {"name": "multiplication_division$ebnf$3", "symbols": []},
    {"name": "multiplication_division$ebnf$3", "symbols": ["multiplication_division$ebnf$3", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "multiplication_division$ebnf$4", "symbols": []},
    {"name": "multiplication_division$ebnf$4", "symbols": ["multiplication_division$ebnf$4", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "multiplication_division", "symbols": ["multiplication_division", "multiplication_division$ebnf$3", "divide", "multiplication_division$ebnf$4", "exponent"], "postprocess": arithmeticPost},
    {"name": "multiplication_division", "symbols": ["exponent"], "postprocess": id},
    {"name": "exponent$ebnf$1", "symbols": []},
    {"name": "exponent$ebnf$1", "symbols": ["exponent$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "exponent$ebnf$2", "symbols": []},
    {"name": "exponent$ebnf$2", "symbols": ["exponent$ebnf$2", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "exponent", "symbols": ["parens", "exponent$ebnf$1", "exponent", "exponent$ebnf$2", "exponent"], "postprocess": arithmeticPost},
    {"name": "exponent", "symbols": ["parens"], "postprocess": id},
    {"name": "parens$ebnf$1", "symbols": []},
    {"name": "parens$ebnf$1", "symbols": ["parens$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "parens$ebnf$2", "symbols": []},
    {"name": "parens$ebnf$2", "symbols": ["parens$ebnf$2", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "parens", "symbols": [{"literal":"("}, "parens$ebnf$1", "arithmetic", "parens$ebnf$2", {"literal":")"}], "postprocess": data => data[2]},
    {"name": "parens", "symbols": ["number"], "postprocess": id},
    {"name": "plus", "symbols": [(lexer.has("plus") ? {type: "plus"} : plus)], "postprocess": id},
    {"name": "minus", "symbols": [(lexer.has("minus") ? {type: "minus"} : minus)], "postprocess": id},
    {"name": "times", "symbols": [(lexer.has("times") ? {type: "times"} : times)], "postprocess": id},
    {"name": "divide", "symbols": [(lexer.has("divide") ? {type: "divide"} : divide)], "postprocess": id},
    {"name": "exponent", "symbols": [(lexer.has("exponent") ? {type: "exponent"} : exponent)], "postprocess": id},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": numberPost},
    {"name": "number", "symbols": ["function"], "postprocess": id},
    {"name": "number", "symbols": ["reference"], "postprocess": id},
    {"name": "number", "symbols": ["scoped_reference"], "postprocess": id},
    {"name": "each$ebnf$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "each$ebnf$1", "symbols": ["each$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "each$ebnf$2", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "each$ebnf$2", "symbols": ["each$ebnf$2", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "each", "symbols": ["reference", "each$ebnf$1", (lexer.has("each") ? {type: "each"} : each), "each$ebnf$2", "operation"], "postprocess": eachPost},
    {"name": "each$ebnf$3", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "each$ebnf$3", "symbols": ["each$ebnf$3", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "each$ebnf$4", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "each$ebnf$4", "symbols": ["each$ebnf$4", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "each", "symbols": ["function", "each$ebnf$3", (lexer.has("each") ? {type: "each"} : each), "each$ebnf$4", "operation"], "postprocess": eachPost},
    {"name": "function$ebnf$1", "symbols": []},
    {"name": "function$ebnf$1", "symbols": ["function$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "function$ebnf$2", "symbols": []},
    {"name": "function$ebnf$2", "symbols": ["function$ebnf$2", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "function$ebnf$3", "symbols": []},
    {"name": "function$ebnf$3", "symbols": ["function$ebnf$3", "parameter_list"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "function$ebnf$4", "symbols": []},
    {"name": "function$ebnf$4", "symbols": ["function$ebnf$4", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "function", "symbols": ["identifier", "function$ebnf$1", {"literal":"("}, "function$ebnf$2", "function$ebnf$3", "function$ebnf$4", {"literal":")"}], "postprocess": functionPost},
    {"name": "parameter_list$ebnf$1", "symbols": []},
    {"name": "parameter_list$ebnf$1", "symbols": ["parameter_list$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "parameter_list$ebnf$2", "symbols": []},
    {"name": "parameter_list$ebnf$2", "symbols": ["parameter_list$ebnf$2", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "parameter_list", "symbols": ["function_param", "parameter_list$ebnf$1", {"literal":","}, "parameter_list$ebnf$2", "parameter_list"], "postprocess": functionParamPost},
    {"name": "parameter_list", "symbols": ["function_param"]},
    {"name": "function_param", "symbols": ["arithmetic"], "postprocess": id},
    {"name": "function_param", "symbols": ["boolean"], "postprocess": id},
    {"name": "function_param", "symbols": ["comparison"], "postprocess": id},
    {"name": "function_param", "symbols": ["string"], "postprocess": id},
    {"name": "comparison$ebnf$1", "symbols": []},
    {"name": "comparison$ebnf$1", "symbols": ["comparison$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "comparison$ebnf$2", "symbols": []},
    {"name": "comparison$ebnf$2", "symbols": ["comparison$ebnf$2", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "comparison", "symbols": ["comparable", "comparison$ebnf$1", "comparison_operator", "comparison$ebnf$2", "comparable"], "postprocess": comparisonPost},
    {"name": "comparable", "symbols": ["number"], "postprocess": id},
    {"name": "comparable", "symbols": ["boolean"], "postprocess": id},
    {"name": "comparable", "symbols": ["string"], "postprocess": id},
    {"name": "comparison_operator", "symbols": [(lexer.has("equals") ? {type: "equals"} : equals)], "postprocess": id},
    {"name": "comparison_operator", "symbols": [(lexer.has("not_equals") ? {type: "not_equals"} : not_equals)], "postprocess": id},
    {"name": "comparison_operator", "symbols": [(lexer.has("lt") ? {type: "lt"} : lt)], "postprocess": id},
    {"name": "comparison_operator", "symbols": [(lexer.has("lte") ? {type: "lte"} : lte)], "postprocess": id},
    {"name": "comparison_operator", "symbols": [(lexer.has("gt") ? {type: "gt"} : gt)], "postprocess": id},
    {"name": "comparison_operator", "symbols": [(lexer.has("gte") ? {type: "gte"} : gte)], "postprocess": id},
    {"name": "reference", "symbols": [(lexer.has("reference") ? {type: "reference"} : reference)], "postprocess": referencePost},
    {"name": "scoped_reference", "symbols": [(lexer.has("scoped_reference") ? {type: "scoped_reference"} : scoped_reference)], "postprocess": scopedReferencePost},
    {"name": "identifier", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": id},
    {"name": "string", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": id},
    {"name": "boolean", "symbols": [(lexer.has("boolean") ? {type: "boolean"} : boolean)], "postprocess": booleanPost}
  ],
  ParserStart: "main",
};

export default grammar;
