<script lang="ts" setup>
import {ref} from 'vue';
import { storeToRefs } from "pinia"
import VueJsonPretty from 'vue-json-pretty'

import 'vue-json-pretty/lib/styles.css'
import Layout from "./Layout.vue"
import { useFieldStore } from './stores/useFieldStore'
import Fields from './components/Fields.vue'
import CategorizedNodes from './components/CategorizedNodes.vue'
import ResolveOutput from './components/ResolveOutput.vue'
import Dependants from './components/Dependants.vue'
import Button from './components/Button.vue'

const fieldStore = useFieldStore()
const { fieldAst } = storeToRefs(fieldStore)

function handleFocusChange(fieldName: string) {
  fieldStore.setFocusedField(fieldName)
}

const viewJson = ref(false)
function toggleJsonView() {
  viewJson.value = !viewJson.value
}
</script>

<template>
  <Layout>
    <template #left>
      <Fields @focus-change="handleFocusChange" />
      <div class="mt-4">
        <Button @click="toggleJsonView">Toggle Render JSON (slow!)</Button>
      </div>
    </template>

    <template #center v-if="viewJson">
      <VueJsonPretty v-if="fieldAst?.tree" :data="{ parsed: fieldAst.tree }" />
      <span v-else class="text-gray-400 text-lg">No Input!</span>
    </template>

    <template #right>
      <CategorizedNodes />
      <ResolveOutput />
      <Dependants />
    </template>
  </Layout>
</template>
