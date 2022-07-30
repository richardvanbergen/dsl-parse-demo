@{%
import lexer from "./lexer"

function arithmeticPost(data: any) {
    const firstElement = data[0]
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

function functionParamPost(data: any) {
    const funcParam = Array.isArray(data[4]) ? data[4] : [data[4]]
    return [data[0], ...funcParam]
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
%}

@lexer lexer
@preprocessor typescript
@builtin "whitespace.ne"

main -> _ value _ {% data => data[1] %}
value -> formula

formula -> formula_identifier boolean {% data => ({ ...data[0], value: data[1] }) %}
         | formula_identifier arithmetic {% data => ({ ...data[0], value: data[1] }) %}

formula_identifier -> %formula {% id %}

arithmetic -> addition_subtraction {% data => { return data[0] } %}

addition_subtraction -> addition_subtraction _ plus _ multiplication_division {% arithmeticPost %}
                      | addition_subtraction _ minus _ multiplication_division {% arithmeticPost %}
                      | multiplication_division {% id %}

multiplication_division -> multiplication_division _ times _ exponent {% arithmeticPost %}
                         | multiplication_division _ divide _ exponent {% arithmeticPost %}
                         | exponent {% id %}

exponent -> parens _ exponent _ exponent {% arithmeticPost %}
          | parens {% id %}

parens -> "(" _ arithmetic _ ")" {% data => data[2] %}
        | number {% id %}

plus -> %plus {% id %}
minus -> %minus {% id %}
times -> %times {% id %}
divide -> %divide {% id %}
exponent -> %exponent {% id %}

number -> %number {% numberPost %}
        | function {% id %}
        | reference {% id %}

function -> identifier _ "(" _ parameter_list:* _ ")" {% functionPost %}

parameter_list
    -> function_param _ "," _ parameter_list {% functionParamPost %}
     | function_param

function_param -> arithmetic {% id %}
                | boolean  {% id %}
                | string {% id %}

reference -> %reference {% referencePost %}
identifier -> %identifier {% id %}
string -> %string {% id %}
boolean -> %boolean {% booleanPost %}
