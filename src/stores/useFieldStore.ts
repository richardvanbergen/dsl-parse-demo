import { acceptHMRUpdate, defineStore } from 'pinia'

import type {
  GrammarType,
  ParsedFormula,
  ParsedGrammar
} from '../editor/grammarTypes'

import {
  flatten,
  getFieldDependencies,
  updateDependantsGraph,
  validateDependantsGraph,
  GraphValidationError,
} from '../editor/ast'

import {
  stringResolver,
  createResultResolver
} from '../editor/resolvers'

import { Inputs, ResolvedValue } from "../editor/resolve";
import {omit} from "lodash";

type FieldInformation = {
  list: ParsedGrammar[] | undefined
  tree: ParsedFormula | undefined
  dependencies: Set<string> | undefined
}

export const useFieldStore = defineStore('fieldStore', {
  state: () => ({
    counter: 1,
    focusedField: "",
    dependantsGraph: new Map<string, Set<string>>(),

    inputs: {
      input: new Map<string, ResolvedValue>(),
      values: new Map<string, ResolvedValue>(),
    } as Inputs,

    fields: new Map<string, FieldInformation | null>(),
  }),
  getters: {
    fieldDependencies: function (): string[] {
      const set = this.fields.get(this.focusedField)?.dependencies ?? new Set()
      return [...set]
    },
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
    cleanInput: function(): Record<string, unknown> {
      const cleanInputs: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(Object.fromEntries(this.inputs.input))) {
        cleanInputs[key] = value.value
      }

      return cleanInputs
    },
    cleanResolvedValues: function(): Record<string, unknown> {
      const resolvedValues = this.inputs.values
      const values = this.focusedField
        ? omit(Object.fromEntries(resolvedValues), this.focusedField)
        : Object.fromEntries(resolvedValues)

      const cleanValues: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(values)) {
        cleanValues[key] = value.value
      }

      return cleanValues
    },
    formulaInput(): Record<string, unknown> {
      return {
        input: this.cleanInput,
        ...this.cleanResolvedValues
      }
    },
    resolvedOutput: function(): unknown | undefined {
      return this.inputs.values.get(this.focusedField)
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
      this.inputs.input.set(key, { value })
      const dependents = this.dependantsGraph.get('input') ?? []

      dependents.forEach(dependent => {
        this.resolveField(dependent)
      })
    },
    resolveField(field: string) {
      const target = this.fields.get(field)
      if (target?.tree) {
        try {
          validateDependantsGraph(field, this.dependantsGraph)
        } catch (e) {
          if (e instanceof GraphValidationError) {
            this.inputs.values.set(field, {
              value: null,
              error: e.message,
            })
            return
          }

          throw e
        }

        const resolver = createResultResolver(this.formulaInput)

        try {
          this.inputs.values.set(field, {
            value: resolver(target.tree)
          })

          const dependents = this.dependantsGraph.get(field) ?? []
          dependents.forEach(dependent => {
            this.resolveField(dependent)
          })
        } catch (e) {
          const error = e as Error
          this.inputs.values.set(field, { value: null, error: error.message })
          return
        }
      }
    },
    updateAst(field: string, ast: ParsedFormula) {
      const flattened = ast ? [...flatten(ast)] : []

      const previousDependencies = this.fields.get(field)?.dependencies ?? new Set()
      const currentDependencies = getFieldDependencies(flattened)

      this.dependantsGraph = updateDependantsGraph(field, previousDependencies, currentDependencies, this.dependantsGraph)

      this.fields.set(field, {
        list: flattened,
        tree: ast,
        dependencies: currentDependencies
      })

      this.resolveField(field)
    },
    createNewField() {
      const id = `field${this.counter}`
      this.fields.set(id, null)
      this.inputs.values.set(id, { value: null })
      this.counter++
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFieldStore, import.meta.hot))
}
