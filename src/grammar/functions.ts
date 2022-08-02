import { max, min, round } from "mathjs";

export const registeredFunctions = new Map<string, {
  info?: string,
  detail?: string,
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

registeredFunctions.set('PRINT_REPLACE', {
  fn: (parsedGrammar) => {
    const value = parsedGrammar[0]
    return String(parsedGrammar[1]).replaceAll('%', String(value))
  },
  info: "PRINT_REPLACE(value: string, replacement: string)",
  detail: 'Replaces all "%" in a string with a value',
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
    completions.push({
      label: `${key}()`,
      type: 'keyword',
      info: value.info,
      detail: value.detail,
    })
  }

  return completions
}
