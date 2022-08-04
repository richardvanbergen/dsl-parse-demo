<script lang="ts" setup>
import {storeToRefs} from "pinia";
import {useFieldStore} from "../stores/useFieldStore";
import Card from "./Card.vue";

const fieldStore = useFieldStore()
const { formInputs, formValues } = storeToRefs(fieldStore)

function handleChange(e: Event) {
  const target = (<HTMLInputElement>e.target)
  fieldStore.updateInput(target.name, target.value)
}

function handleChecked(e: Event) {
  const target = (<HTMLInputElement>e.target)
  fieldStore.updateInput(target.name, target.checked)
}
</script>

<template>
  <Card>
    <template #title>
      Data Model
    </template>
    <template #content v-if="formInputs?.size">
      <div class="flex flex-col gap-4">
        <div v-for="[name, input] of formInputs">
          <div v-if="['text', 'email', 'password'].includes(input.uiType)">
            <label :for="name" class="block text-sm font-medium text-gray-700 block mb-1">{{ input.label }}</label>
            <input
              v-model="formValues[name]"
              :type="input.uiType"
              :name="name"
              :id="name"
              @input="handleChange"
              class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" />
          </div>

          <div class="relative flex items-start" v-if="input.uiType === 'checkbox'">
            <div class="flex items-center h-5">
              <input v-model="formValues[name]" :id="name" :aria-describedby="`${name}-description`" :name="name" type="checkbox" @input="handleChecked" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
            </div>
            <div class="ml-3 text-sm">
              <label :for="name" class="font-medium text-gray-700">{{ input.label }}</label>
              <p :id="`${name}-description`" class="text-gray-500" v-if="input.description">{{ input.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
