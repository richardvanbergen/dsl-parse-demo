import { max, min, round } from "mathjs";

export type FormInput = {
  name: string,
  label: string,
  uiType: string,
  description?: string,
  defaultValue?: unknown,
  resolveType: 'string' | 'number' | 'boolean',
}

export const registeredFunctions = new Map<string, {
  info?: string,
  detail?: string,
  params?: string[],
  inputs?: FormInput[],
  fn: (value: unknown[]) => unknown
}>()

registeredFunctions.set('MIN', {
  fn: (parsedGrammar) => {
    return min(...parsedGrammar.map(value => Number(value)))
  },
  info: "MIN(a: number, b: number, ...)",
  detail: "Returns the smallest of the given values",
})

registeredFunctions.set('MAX', {
  fn: (parsedGrammar) => {
    return max(...parsedGrammar.map(value => Number(value)))
  },
  info: "MAX(a: number, b: number, ...)",
  detail: 'Returns the largest of the given values',
})

registeredFunctions.set('ROUND', {
  fn: (parsedGrammar) => {
    const value = Number(parsedGrammar[0])
    const precision = Number(parsedGrammar[1])
    return round(value, precision)
  },
  info: "ROUND(value: number, precision: number)",
  detail: 'Rounds a value to a given precision',
})

registeredFunctions.set('STRING_REPLACE', {
  fn: (parsedGrammar) => {
    const template = String(parsedGrammar[0])
    const replace = String(parsedGrammar[1])
    return String(template).replaceAll('%', String(replace))
  },
  info: "STRING_REPLACE(template: string, replacement: string)",
  detail: 'Replaces all "%" in a string with a value',
})

registeredFunctions.set('JSON', {
  fn: (parsedGrammar) => {
    const json = String(parsedGrammar[0])
    if (json) {
      return JSON.parse(json)
    }
  },
  info: "JSON(json_stringified: string)",
  params: ['$input.jsonInput'],
  detail: 'Get the value of a JSON string',
  inputs: [
    {
      name: 'jsonInput',
      label: 'JSON Input',
      uiType: 'text',
      defaultValue: '{}',
      resolveType: 'string'
    },
  ]
})

export function toResolvers(functions: typeof registeredFunctions) {
  const resolvers = new Map<string, (value: unknown[]) => unknown>()

  for (let [key, value] of functions) {
    resolvers.set(key, value.fn)
  }

  return resolvers
}

export function toCompletions(functions: typeof registeredFunctions) {
  const completions: {label: string, type: string, detail?: string, info?: string}[] = []

  for (let [key, value] of functions) {
    const params = value.params ? value.params.join(', ') : ''
    completions.push({
      label: `${key}(${params})`,
      type: 'keyword',
      info: value.info,
      detail: value.detail,
    })
  }

  return completions
}
