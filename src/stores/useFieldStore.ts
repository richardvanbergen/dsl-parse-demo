import { defineStore } from "pinia";
import { ParsedFormula } from "../grammar/parser";

export const useFieldStore = defineStore('fieldStore', {
  state: () => ({
    counter: 1,
    focusedField: "",
    fields: new Map<string, ParsedFormula[] | null>(),
  }),
  getters: {
    fieldAst(state) {
      return Object.fromEntries(state.fields)?.[state.focusedField]
    }
  },
  actions: {
    setFocusedField(field: string) {
      this.focusedField = field
    },
    updateAst(field: string, ast: ParsedFormula[] | null = null) {
      this.fields.set(field, ast)
    },
    createNewField() {
      const id = `field${this.counter}`
      this.fields.set(id, null)
      this.counter++
    },
  },
})
