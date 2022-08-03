<script lang="ts" setup>
import { useFieldStore } from "../stores/useFieldStore"
import { storeToRefs } from "pinia"
import { computed } from "vue"

const props = defineProps<{
  fieldName: string
}>()

const fieldStore = useFieldStore()
const { fields, cleanInput, inputs } = storeToRefs(fieldStore)

const dependencies = computed(() => fields.value.get(props.fieldName)?.dependencies ?? [])

const inputValue = computed(() => {
  const reference = props.fieldName === 'input'
    ? cleanInput.value
    : inputs.value.values.get(props.fieldName)

  if (reference) {
    console.log(props.fieldName, reference)
    return reference
  }

  return null
})
</script>

<template>
  <div class="p-2 px-4 rounded mb-2 bg-slate-100" v-if="fieldName">
    <p class="font-semibold text-gray-800">{{ fieldName }}</p>
    <span v-if="fieldName === 'input'" class="text-purple-800">{{ inputValue }}</span>
    <span v-else :class="[inputValue?.error ? 'text-red-500' : 'text-green-500']">
      {{ inputValue?.error ?? inputValue?.value }}
    </span>
  </div>

  <div v-for="dependency of dependencies" class="ml-4">
    <DependencyNode :field-name="dependency" />
  </div>
</template>
