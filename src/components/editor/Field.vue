<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { newEditor } from "./editor"
import { ParsedFormula } from "../../grammar/parser";

const props = defineProps<{
  name: string,
  hasFocus: boolean
}>()

const emit = defineEmits<{
  (e: 'change', fieldName: string, ast: ParsedFormula | undefined): void
  (e: 'focus-change', fieldName: string): void
}>()

const selectField = () => {
  emit('focus-change', props.name)
}

function handleChange(value: ParsedFormula | undefined) {
  emit('change', props.name, value)
}

const element = ref<HTMLElement | null>(null)
onMounted(() => {
  if (element.value) {
    newEditor(element.value, [
      handleChange
    ])
  }
})
</script>

<template>
  <div @click="selectField" :data-field-capture="props.name" class="cursor-pointer outline-zinc-900 outline-offset-1 outline-1 p-2 shadow" :class="{ [`outline`]: hasFocus }">
    <label :for="`editor-${props.name}`" class="cursor-pointer mb-2 block">
      <slot />
    </label>

    <div class="cursor-text" :id="`editor-${props.name}`" ref="element"></div>
  </div>
</template>
