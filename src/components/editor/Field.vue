<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { newEditor } from "./editor"
import { parse, ParsedFormula } from "../../grammar/parser";

const props = defineProps<{
  name: string,
  hasFocus: boolean
}>()

const emit = defineEmits<{
  (e: 'update-ast', fieldName: string, ast: ParsedFormula[] | undefined): void
  (e: 'focus-change', fieldName: string): void
}>()

const selectField = () => {
  emit('focus-change', props.name)
}

const element = ref<HTMLElement | null>(null)
onMounted(() => {
  if (element.value) {
    newEditor(element.value, (value) => {
      try {
        emit('update-ast', props.name, parse(value))
      } catch (e) {
      }
    })
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
