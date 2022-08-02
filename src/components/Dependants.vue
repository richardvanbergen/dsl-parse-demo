<script lang="ts" setup>
import Card from './Card.vue'
import { useFieldStore } from '../stores/useFieldStore'
import {storeToRefs} from "pinia";

const { debugDependants } = storeToRefs(useFieldStore())
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
    </template>
  </Card>
</template>
