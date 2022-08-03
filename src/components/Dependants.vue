<script lang="ts" setup>
import Card from './Card.vue'
import DependencyNode from './DependencyNode.vue'
import { useFieldStore } from '../stores/useFieldStore'
import {storeToRefs} from "pinia";

const { debugDependants, focusedField } = storeToRefs(useFieldStore())
</script>

<template>
  <Card>
    <template #title>
      Dependants
      <p class="text-gray-500 text-sm">These values should always remain in sync if everything is working</p>
    </template>
    <template #content>
      <div class="flex">
        <div class="flex-1">
          <h4 class="text-gray-400">
            Depends On
          </h4>

          {{ debugDependants.dependsOn }}
        </div>

        <div class="flex-1">
          <h4 class="text-gray-400">
            Updated By
          </h4>

          {{ debugDependants.updatedBy }}
        </div>
      </div>

      <div class="mt-4 bg-slate-700 rounded p-4 pb-2">
        <DependencyNode :field-name="focusedField" />
      </div>
    </template>
  </Card>
</template>
