<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { newEditor } from "./editor"
import { isReference, isFunction, isFormula, ParsedFormula, ParsedGrammar, ParsedReference } from "../../grammar/parser";

const props = defineProps<{
  name: string,
  hasFocus: boolean
}>()

const emit = defineEmits<{
  (e: 'change', fieldName: string, ast: ParsedFormula[] | undefined): void
  (e: 'focus-change', fieldName: string): void
}>()

const selectField = () => {
  emit('focus-change', props.name)
}

function findReferences<T extends ParsedGrammar>(ast: T) {
  let references: ParsedReference[] = []
  if (isReference(ast)) {
    references.push(ast)
  }

  if (isFormula(ast)) {
    references = [...references, ...findReferences(ast.value)]
  }

  if (isFunction(ast)) {
    // for (const param of ast.value.params) {
    //   if (isReference(param)) {
    //     references.push(param)
    //   }
    //   references.push(...findReferences(arg))
    // }
    // return [...references, ...findReferences(ast.value)]
  }
  return references
}

function registerFields(value: ParsedFormula[] | undefined) {
  if (value?.length) {
    return findReferences(value[0])
  }
}

function handleChange(value: ParsedFormula[] | undefined) {
  emit('change', props.name, value)
}

const element = ref<HTMLElement | null>(null)
onMounted(() => {
  if (element.value) {
    newEditor(element.value, [
      handleChange,
      registerFields
    ])
  }
})
</script>

<template>
  <div @click="selectField" :data-field-capture="props.name" class="outline-zinc-900 outline-offset-1 outline-1 p-2 shadow" :class="{ [`outline`]: hasFocus }">
    <label :for="`editor-${props.name}`" class="mb-2 block">
      <slot />
    </label>

    <div :id="`editor-${props.name}`" ref="element"></div>
  </div>
</template>
