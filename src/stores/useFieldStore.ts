import { acceptHMRUpdate, defineStore } from "pinia"
import { flatten, GrammarType, ParsedFormula, ParsedGrammar } from "../grammar/parser"
import { compileFormula } from "../grammar/compile"

export const useFieldStore = defineStore('fieldStore', {
  state: () => ({
    counter: 1,
    focusedField: "",
    fields: new Map<string, ParsedFormula | null>(),
  }),
  getters: {
    compiledOutput: function(): string {
      const ast = this.fieldAst
      if (ast) {
        return compileFormula(ast, { input: { age: 23 } })
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
