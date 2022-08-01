<script lang="ts" setup>
import { storeToRefs } from "pinia"
import VueJsonPretty from 'vue-json-pretty'

import 'vue-json-pretty/lib/styles.css'
import Layout from "./Layout.vue"
import { useFieldStore } from "./stores/useFieldStore"
import Fields from "./components/Fields.vue"
import CategorizedNodes from "./components/CategorizedNodes.vue";
import CompiledOutput from "./components/CompiledOutput.vue";

const fieldStore = useFieldStore()
const { fieldAst } = storeToRefs(fieldStore)

function handleFocusChange(fieldName: string) {
  fieldStore.setFocusedField(fieldName)
}
</script>

<template>
  <Layout>
    <template #left>
      <Fields @focus-change="handleFocusChange" />
    </template>

    <template #center>
      <VueJsonPretty v-if="fieldAst" :data="{ parsed: fieldAst }" />
    </template>

    <template #right>
      <CategorizedNodes />
      <CompiledOutput />

      Required Field Inputs
    </template>
  </Layout>
</template>
