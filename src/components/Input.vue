<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useFieldStore} from "../stores/useFieldStore";
import Card from "./Card.vue";
import {computed, reactive} from "vue";
import {registeredFunctions} from "../editor/functions";

const fieldStore = useFieldStore()
const {referencedFunctions} = storeToRefs(fieldStore)

const inputs = computed(() => {
  let inputs: Record<string, unknown>[] = [];

  [...referencedFunctions.value].forEach(refFn => {
    const refInputs = registeredFunctions.get(refFn)?.inputs
    if (refInputs) {
      inputs = [...inputs, ...refInputs]
    }
  })

  return inputs
})

const formState = reactive<Record<string, string>>({})

function handleChange(e: Event) {
  const target = (<HTMLInputElement>e.target)
  fieldStore.updateInput(target.name, target.value)
}
</script>

<template>
  <Card>
    <template #title>
      Data Model
    </template>
    <template #content v-if="inputs?.length">
      <div v-for="input of inputs">
        <label :for="input.name" class="block text-sm font-medium text-gray-700">{{ input.label }}</label>
        <div class="mt-1">
          <input
            v-model="formState[input.name]"
            :type="input.uiType"
            :name="input.name"
            :id="input.name"
            @input="handleChange"
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/>
        </div>
      </div>
    </template>
  </Card>
</template>
