<script lang="ts" setup>
import Field from "./editor/Field.vue"
import {onMounted, ref} from "vue"
import { ParsedFormula } from "../editor/grammarTypes"
import { useFieldStore } from "../stores/useFieldStore"
import {storeToRefs} from "pinia";
import Button from "./Button.vue";

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

const handleChange = (fieldName: string, ast: ParsedFormula | undefined) => {
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

onMounted(() => {
  fieldStore.addInputField({
    name: "age",
    label: "Age",
    uiType: "text",
    defaultValue: 20,
    resolveType: "number",
  })

  fieldStore.addInputField({
    name: "name",
    label: "Name",
    uiType: "text",
    resolveType: "string",
  })

  fieldStore.addInputField({
    name: "receiveMarketing",
    label: "Would you like to receive marketing emails?",
    description: "We'll send you occasional emails about new products and events.",
    uiType: "checkbox",
    resolveType: "boolean",
  })
})

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

    <Button @click="createEmptyField">Create Field</Button>
  </div>
</template>
