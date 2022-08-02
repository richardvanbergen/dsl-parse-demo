import { acceptHMRUpdate, defineStore } from "pinia"
import { flatten, GrammarType, ParsedFormula, ParsedGrammar } from "../editor/parser"
import { createResolver } from "../editor/resolve"
import { toResolvers, registeredFunctions } from "../editor/functions";
import { divide, multiply, pow, subtract, sum } from "mathjs";
import get from 'lodash/get'

const functions = toResolvers(registeredFunctions)
// parser should ensure that left and right are both resolvable to a number
// if not then this will throw an error as we have bad input
type OperationFn = (x: unknown, y: unknown) => number

const getOperationFunction = (operation: string) => {
  if (operation === '+') {
    return sum as OperationFn
  }

  if (operation === '-') {
    return subtract as OperationFn
  }

  if (operation === '*') {
    return multiply as OperationFn
  }

  if (operation === '/') {
    return divide as OperationFn
  }

  if (operation === '^') {
    return pow as OperationFn
  }
}

const compiledResolver = createResolver<string>({
  function: (name, params) => {
    return `${name}(${params.join(',')})`
  },
  arithmetic: (left, operator, right) => {
    return `(${left} ${operator} ${right})`
  },
  primitive: (value) => value,
  reference: (identifier, subPaths) => {
    let combine: string[] = [identifier]
    if (subPaths && subPaths.length > 0) {
      combine = [...combine, ...subPaths]
    }
    return `$${combine.join('.')}`
  },
})

const createResultResolver = (inputValues: { input: Record<string, unknown> }) => {
  return createResolver<unknown>({
    function: (name, params) => {
      const toRun = functions.get(name)

      if (toRun) {
        return toRun(params)
      }
    },
    arithmetic: (left, operator, right) => {
      const operationFn = getOperationFunction(operator)

      if (operationFn) {
        return operationFn(left, right)
      }
    },
    primitive: (value) => value,
    reference: (identifier, subPaths) => {
      let combine = [identifier]
      if (subPaths && subPaths.length > 0) {
        combine = [...combine, ...subPaths]
      }

      return get(inputValues, combine)
    },
  })
}

export const useFieldStore = defineStore('fieldStore', {
  state: () => ({
    counter: 1,
    focusedField: "",
    resolvedValues: new Map<string, unknown>(),
    input: new Map<string, unknown>(),
    fields: new Map<string, ParsedFormula | null>(),
  }),
  getters: {
    debugOutput: function(): { name: string, value: unknown, color: string, description: string }[] {
      const result = this.resolvedOutput
      const formula = this.compiledOutput

      return [
        {
          name: "Result",
          value: result,
          color: "bg-green-600",
          description: "Final result of the formula",
        },
        {
          name: "Formula",
          value: formula,
          color: "bg-purple-600",
          description: "Formula with branch values calculated",
        },
      ]
    },
    resolvedOutput: function(): unknown | undefined {
      const ast = this.fieldAst
      if (ast) {
        const resolver = createResultResolver({ input: Object.fromEntries(this.input) })
        return resolver(ast)
      }
    },
    compiledOutput: function(): string {
      const ast = this.fieldAst
      if (ast) {
        return compiledResolver(ast) ?? ''
      }

      return ""
    },
    categorizedNodes: function(): Map<GrammarType, ParsedGrammar[]> {
      return this.nodeList.reduce((acc, node) => {
        const values = acc.get(node.type) ?? []
        acc.set(node.type, [...values, node])
        return acc
      }, new Map<GrammarType, ParsedGrammar[]>())
    },
    nodeList: function (): ParsedGrammar[] {
      if (this.fieldAst) {
        return [...flatten(this.fieldAst)]
      }

      return []
    },
    fieldAst(state) {
      return state.fields.get(state.focusedField)
    },
  },
  actions: {
    setFocusedField(field: string) {
      this.focusedField = field
    },
    updateInput(key: string, value: unknown) {
      this.input.set(key, value)
    },
    updateAst(field: string, ast: ParsedFormula | null = null) {
      this.fields.set(field, ast)
    },
    createNewField() {
      const id = `field${this.counter}`
      this.fields.set(id, null)
      this.counter++
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFieldStore, import.meta.hot))
}
