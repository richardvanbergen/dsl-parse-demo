<script lang="ts" setup>
import { storeToRefs } from "pinia";
import {useFieldStore} from "../stores/useFieldStore";

const fieldStore = useFieldStore()
const { compiledOutput } = storeToRefs(fieldStore)
</script>

<template>
  <div class="bg-white shadow overflow-hidden rounded-md">
    <div class="divide-y divide-gray-200">
      <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Compiled Formula</h3>
      </div>

      <div class="divide-y divide-gray-200">
        <div class="relative bg-white py-5 px-4 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
          {{ compiledOutput }}
        </div>
      </div>
    </div>
  </div>
</template>
