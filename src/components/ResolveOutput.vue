<script lang="ts" setup>
import { storeToRefs } from "pinia";
import {useFieldStore} from "../stores/useFieldStore";
import Card from "./Card.vue";

const fieldStore = useFieldStore()
const { debugOutput } = storeToRefs(fieldStore)
</script>

<template>
  <Card>
    <template #title>
      Outputs
    </template>
    <template #content>
      <ul role="list" class="grid grid-cols-1 sm:gap-4">
        <li v-for="output in debugOutput" :key="output.name" class="col-span-1 flex shadow-sm rounded-md">
          <div :class="[output.color, 'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md']">
            {{ output.name.at(0) }}
          </div>

          <div class="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
            <div class="flex-1 px-4 py-2 text-sm truncate">
              <p class="text-gray-900 font-medium hover:text-gray-600">{{ output.name }}</p>
              <p class="text-gray-400 font-medium hover:text-gray-400">{{ output.description }}</p>
              <template v-if="output.value">
                <p v-if="typeof output.value === 'string'" class="text-purple-500">{{ output.value }}</p>
                <p v-else :class="output.value.error ? 'text-red-500' : 'text-green-500'">{{ output.value.error ?? output.value.value }}</p>
              </template>
            </div>
          </div>
        </li>
      </ul>
    </template>
  </Card>
</template>
