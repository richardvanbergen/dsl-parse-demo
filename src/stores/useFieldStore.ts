import { acceptHMRUpdate, defineStore } from "pinia"
import { flatten, GrammarType, ParsedFormula, ParsedGrammar } from "../editor/parser"
import { compileFormula } from "../editor/compile"
import {createResolver, ResolvedBranch} from "../editor/resolve"
import {toResolvers, registeredFunctions} from "../editor/functions";

const resolver = createResolver(toResolvers(registeredFunctions))

export const useFieldStore = defineStore('fieldStore', {
  state: () => ({
    counter: 1,
    focusedField: "",
    input: new Map<string, unknown>(),
    fields: new Map<string, ParsedFormula | null>(),
  }),
  getters: {
    debugOutput: function(): { name: string, value: unknown, color: string, description: string }[] {
      const result = this.resolvedOutput?.result
      const formula = this.resolvedOutput?.formula
      const compiled = this.compiledOutput

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
        {
          name: "Compiled",
          value: compiled,
          color: "bg-yellow-600",
          description: "Full unresolved formula",
        }
      ]
    },
    resolvedOutput: function(): ResolvedBranch | undefined {
      const ast = this.fieldAst
      if (ast) {
        return resolver(ast, { input: Object.fromEntries(this.input) })
      }
    },
    compiledOutput: function(): string {
      const ast = this.fieldAst
      if (ast) {
        return compileFormula(ast, { input: Object.fromEntries(this.input) })
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
