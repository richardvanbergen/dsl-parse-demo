import { acceptHMRUpdate, defineStore } from 'pinia'

import type {
  GrammarType,
  ParsedFormula,
  ParsedGrammar
} from '../editor/grammarTypes'

import {
  generateDependantsGraph,
  flatten,
  GraphError
} from '../editor/ast'

import {
  stringResolver,
  createResultResolver,
  ArithmeticError,
  FunctionError
} from '../editor/resolvers'

type FieldInformation = {
  list: ParsedGrammar[] | undefined
  tree: ParsedFormula | undefined
  dependencies: Set<string> | undefined
}

export const useFieldStore = defineStore('fieldStore', {
  state: () => ({
    counter: 1,
    focusedField: "",
    resolvedValues: new Map<string, unknown>(),
    dependantsGraph: new Map<string, Set<string>>(),
    input: new Map<string, unknown>(),
    fields: new Map<string, FieldInformation | null>(),
  }),
  getters: {
    debugDependants: function(): { dependsOn: string, updatedBy: string } {
      const updatedBy: string[] = []
      this.fieldAst?.dependencies?.forEach(ref => {
        const dependants = this.dependantsGraph.get(ref) ?? new Set()
        if (dependants.has(this.focusedField)) {
          updatedBy.push(ref)
        }
      })

      return {
        dependsOn: [...this.fieldAst?.dependencies ?? []].join(', '),
        updatedBy: [...updatedBy].join(', ')
      }
    },
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
      return this.resolvedValues.get(this.focusedField)
    },
    compiledOutput: function(): string {
      const ast = this.fieldAst
      if (ast?.tree) {
        return stringResolver(ast.tree) ?? ''
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
      if (this.fieldAst?.list) {
        return this.fieldAst.list
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
      const dependents = this.dependantsGraph.get('input') ?? []

      dependents.forEach(dependent => {
        this.resolveField(dependent)
      })
    },
    resolveField(field: string) {
      const target = this.fields.get(field)
      if (target?.tree) {
        const resolver = createResultResolver({
          ...Object.fromEntries(this.resolvedValues),
          input: Object.fromEntries(this.input)
        })

        try {
          this.resolvedValues.set(field, resolver(target.tree))

          const dependents = this.dependantsGraph.get(field) ?? []
          dependents.forEach(dependent => {
            this.resolveField(dependent)
          })
        } catch (e) {
          if (e instanceof ArithmeticError) {
            this.resolvedValues.set(field, e.message)
            return
          }
          if (e instanceof FunctionError) {
            this.resolvedValues.set(field, e.message)
            return
          }

          throw e
        }
      }
    },
    updateAst(field: string, ast: ParsedFormula) {
      const flattened = ast ? [...flatten(ast)] : []
      const dependencies = this.fields.get(field)?.dependencies ?? new Set()

      try {
        const { fieldDependencies, dependantsGraph } = generateDependantsGraph(field, dependencies, {
          nodeList: flattened,
          dependantsGraph: this.dependantsGraph
        })

        this.dependantsGraph = dependantsGraph

        this.fields.set(field, {
          list: flattened,
          tree: ast,
          dependencies: fieldDependencies
        })

        this.resolveField(field)
      } catch (e) {
        if (e instanceof GraphError) {
          console.error(e.message)
        }

        throw e
      }
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
