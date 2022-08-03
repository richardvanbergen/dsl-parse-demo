<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useFieldStore } from "../stores/useFieldStore";
import Card from "./Card.vue";
import {computed} from "vue";
import {registeredFunctions} from "../editor/functions";

const fieldStore = useFieldStore()
const { referencedFunctions } = storeToRefs(fieldStore)

const inputs = computed(() =>
  [...referencedFunctions.value]
    .map(refFn => {
      return registeredFunctions.get(refFn)?.inputs
    })
    .filter(refFn => refFn)
)
</script>

<template>
  <Card>
    <template #title>
      Data Model
    </template>
    <template #content v-if="inputs?.length">
      <div v-for="input of inputs">
        <div>
          <label :for="input.name" class="block text-sm font-medium text-gray-700">{{ input.label }}</label>
          <div class="mt-1">
            <input :type="input.uiType" :name="input.name" :id="input.name" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
