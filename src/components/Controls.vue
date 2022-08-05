<script lang="ts" setup>
import {ref, watch} from 'vue'
import Card from './Card.vue'
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue'

const emits = defineEmits<{
  (e: 'toggle-json', toggled: boolean): void
  (e: 'toggle-categories', toggled: boolean): void
  (e: 'toggle-input', toggled: boolean): void
  (e: 'toggle-dependants', toggled: boolean): void
  (e: 'toggle-output', toggled: boolean): void
}>()

const showJson = ref(true)
watch(showJson, () => {
  emits('toggle-json', showJson.value)
})

const showCategories = ref(false)
watch(showCategories, () => {
  emits('toggle-categories', showCategories.value)
})

const showInput = ref(false)
watch(showInput, () => {
  emits('toggle-input', showInput.value)
})

const showDependants = ref(false)
watch(showDependants, () => {
  emits('toggle-dependants', showDependants.value)
})

const showOutput = ref(false)
watch(showOutput, () => {
  emits('toggle-output', showOutput.value)
})
</script>

<template>
  <Card>
    <template #title>
      Controls
    </template>

    <template #content>
      <div class="flex flex-col gap-2">

        <SwitchGroup as="div" class="flex items-center">
          <Switch v-model="showInput" :class="[showInput ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500']">
            <span aria-hidden="true" :class="[showInput ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200']" />
          </Switch>
          <SwitchLabel as="span" class="ml-3">
            <span class="text-sm font-medium text-gray-900">Inputs</span>
          </SwitchLabel>
        </SwitchGroup>

        <SwitchGroup as="div" class="flex items-center">
          <Switch v-model="showDependants" :class="[showDependants ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500']">
            <span aria-hidden="true" :class="[showDependants ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200']" />
          </Switch>
          <SwitchLabel as="span" class="ml-3">
            <span class="text-sm font-medium text-gray-900">Dependants</span>
          </SwitchLabel>
        </SwitchGroup>

        <SwitchGroup as="div" class="flex items-center">
          <Switch v-model="showOutput" :class="[showOutput ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500']">
            <span aria-hidden="true" :class="[showOutput ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200']" />
          </Switch>
          <SwitchLabel as="span" class="ml-3">
            <span class="text-sm font-medium text-gray-900">Output</span>
          </SwitchLabel>
        </SwitchGroup>

        <SwitchGroup as="div" class="flex items-center">
          <Switch v-model="showCategories" :class="[showCategories ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500']">
            <span aria-hidden="true" :class="[showCategories ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200']" />
          </Switch>
          <SwitchLabel as="span" class="ml-3">
            <span class="text-sm font-medium text-gray-900">Categorizations</span>
          </SwitchLabel>
        </SwitchGroup>

        <SwitchGroup as="div" class="flex items-center">
          <Switch v-model="showJson" :class="[showJson ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500']">
            <span aria-hidden="true" :class="[showJson ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200']" />
          </Switch>
          <SwitchLabel as="span" class="ml-3">
            <span class="text-sm font-medium text-gray-900">Json Tree</span>
          </SwitchLabel>
        </SwitchGroup>
      </div>
    </template>
  </Card>
</template>
