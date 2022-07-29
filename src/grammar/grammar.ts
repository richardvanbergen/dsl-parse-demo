// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var formula: any;
declare var plus: any;
declare var minus: any;
declare var times: any;
declare var divide: any;
declare var exponent: any;
declare var number: any;
declare var reference: any;
declare var identifier: any;
declare var string: any;
declare var boolean: any;

import lexer from "./lexer"

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
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "main", "symbols": ["_", "value", "_"], "postprocess": data => data[1]},
    {"name": "value", "symbols": ["formula"]},
    {"name": "formula", "symbols": ["formula_identifier", "boolean"], "postprocess": data => ({ ...data[0], value: data[1] })},
    {"name": "formula", "symbols": ["formula_identifier", "arithmetic"], "postprocess": data => ({ ...data[0], value: data[1] })},
    {"name": "formula_identifier", "symbols": [(lexer.has("formula") ? {type: "formula"} : formula)], "postprocess": id},
    {"name": "arithmetic", "symbols": ["addition_subtraction"], "postprocess": id},
    {"name": "addition_subtraction", "symbols": ["addition_subtraction", "_", "plus", "_", "multiplication_division"], "postprocess": data => ({ type: "arithmetic", operation: { left: data[0], operator: data[2], right: data[4] } })},
    {"name": "addition_subtraction", "symbols": ["addition_subtraction", "_", "minus", "_", "multiplication_division"], "postprocess": data => ({ type: "arithmetic", operation: { left: data[0], operator: data[2], right: data[4] } })},
    {"name": "addition_subtraction", "symbols": ["multiplication_division"], "postprocess": id},
    {"name": "multiplication_division", "symbols": ["multiplication_division", "_", "times", "_", "exponent"], "postprocess": data => ({ type: "arithmetic", operation: { left: data[0], operator: data[2], right: data[4] } })},
    {"name": "multiplication_division", "symbols": ["multiplication_division", "_", "divide", "_", "exponent"], "postprocess": data => ({ type: "arithmetic", operation: { left: data[0], operator: data[2], right: data[4] } })},
    {"name": "multiplication_division", "symbols": ["exponent"], "postprocess": id},
    {"name": "exponent", "symbols": ["parens", "_", "exponent", "_", "exponent"], "postprocess": data => ({ type: "arithmetic", operation: { left: data[0], operator: data[2], right: data[4] } })},
    {"name": "exponent", "symbols": ["parens"], "postprocess": id},
    {"name": "parens", "symbols": [{"literal":"("}, "_", "arithmetic", "_", {"literal":")"}], "postprocess": data => data[2]},
    {"name": "parens", "symbols": ["number"], "postprocess": id},
    {"name": "plus", "symbols": [(lexer.has("plus") ? {type: "plus"} : plus)], "postprocess": id},
    {"name": "minus", "symbols": [(lexer.has("minus") ? {type: "minus"} : minus)], "postprocess": id},
    {"name": "times", "symbols": [(lexer.has("times") ? {type: "times"} : times)], "postprocess": id},
    {"name": "divide", "symbols": [(lexer.has("divide") ? {type: "divide"} : divide)], "postprocess": id},
    {"name": "exponent", "symbols": [(lexer.has("exponent") ? {type: "exponent"} : exponent)], "postprocess": id},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess":  data => {
            const parsed = data[0]
            if (parsed) {
                parsed.value = Number(parsed.text)
                return parsed
            }
        } },
    {"name": "number", "symbols": ["function"], "postprocess": id},
    {"name": "number", "symbols": ["reference"], "postprocess": id},
    {"name": "function$ebnf$1", "symbols": []},
    {"name": "function$ebnf$1", "symbols": ["function$ebnf$1", "parameter_list"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "function", "symbols": ["identifier", "_", {"literal":"("}, "_", "function$ebnf$1", "_", {"literal":")"}], "postprocess":  data => {
           data[0].type = "function"
           const params = data[4]?.[0] ?? []
           data[0].value = {
               name: data[0].text,
               params
           }
        
           return data[0]
        }},
    {"name": "parameter_list", "symbols": ["function_param", "_", {"literal":","}, "_", "parameter_list"], "postprocess":  data => {
            const funcParam = Array.isArray(data[4]) ? data[4] : [data[4]]
            return [data[0], ...funcParam]
        } },
    {"name": "parameter_list", "symbols": ["function_param"]},
    {"name": "function_param", "symbols": ["arithmetic"], "postprocess": id},
    {"name": "function_param", "symbols": ["boolean"], "postprocess": id},
    {"name": "function_param", "symbols": ["string"], "postprocess": id},
    {"name": "reference", "symbols": [(lexer.has("reference") ? {type: "reference"} : reference)], "postprocess":  data => {
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
        } },
    {"name": "identifier", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": id},
    {"name": "string", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": id},
    {"name": "boolean", "symbols": [(lexer.has("boolean") ? {type: "boolean"} : boolean)], "postprocess":  data => {
            const parsed = data[0]
            if (parsed) {
                parsed.value = parsed.text === "true"
                return parsed
            }
        } }
  ],
  ParserStart: "main",
};

export default grammar;
