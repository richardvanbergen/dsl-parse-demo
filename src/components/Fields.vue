<script lang="ts" setup>
import Field from "./editor/Field.vue"
import { ref } from "vue"
import { ParsedFormula } from "../grammar/parser"
import { useFieldStore } from "../stores/useFieldStore"
import {storeToRefs} from "pinia";

const fieldStore = useFieldStore()
const { fields } = storeToRefs(fieldStore)
const focus = ref("")

const emits = defineEmits<{
  (e: 'focus-change', fieldName: string): void
}>()

function updateFocus(fieldName: string) {
  focus.value = fieldName
  emits('focus-change', fieldName)
}

const handleChange = (fieldName: string, ast: ParsedFormula[] | undefined) => {
  if (ast) {
    fieldStore.updateAst(fieldName, ast)
  }
}

function hasFocus(fieldName: string) {
  return focus.value === fieldName
}

function createEmptyField() {
  fieldStore.createNewField()
}

document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement
  if (!target.closest('[data-field-capture]')) {
    focus.value = ""
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <Field v-for="fieldName of Object.keys(Object.fromEntries(fields))" :name="fieldName" :has-focus="hasFocus(fieldName)" @change="handleChange" @focus-change="updateFocus">
      {{ fieldName }}
    </Field>

    <button type="button" @click="createEmptyField" class="self-start inline-flex items-center px-2.5 py-1.5 border border-transparent text-md font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      Create Field
    </button>
  </div>
</template>
