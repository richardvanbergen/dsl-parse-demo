<script lang="ts" setup>
import VueJsonPretty from 'vue-json-pretty'
import {useFieldStore} from "../stores/useFieldStore"
import {storeToRefs} from "pinia"
import Card from "./Card.vue";

const fieldStore = useFieldStore()
const {fieldAst} = storeToRefs(fieldStore)
</script>

<template>
  <Card>
    <template #title>
      Parsed Tree
    </template>
    <template #content>
      <VueJsonPretty v-if="fieldAst?.tree" :data="fieldAst.tree"/>
      <span v-else class="text-gray-400 text-lg">No Input!</span>
    </template>
  </Card>
</template>
