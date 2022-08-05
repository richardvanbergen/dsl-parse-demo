<script lang="ts" setup>
import {ref} from 'vue';

import 'vue-json-pretty/lib/styles.css'
import { useFieldStore } from './stores/useFieldStore'
import Layout from "./Layout.vue"
import Fields from './components/Fields.vue'
import CategorizedNodes from './components/CategorizedNodes.vue'
import ResolveOutput from './components/ResolveOutput.vue'
import Dependants from './components/Dependants.vue'
import Input from './components/Input.vue'
import JsonTree from "./components/JsonTree.vue"
import Card from "./components/Card.vue"
import Controls from "./components/Controls.vue"

const fieldStore = useFieldStore()

function handleFocusChange(fieldName: string) {
  fieldStore.setFocusedField(fieldName)
}

const viewJson = ref(true)
function toggleJsonView(value: boolean) {
  viewJson.value = value
}

const viewCategories = ref(false)
function toggleCategories(value: boolean) {
  viewCategories.value = value
}

const viewInput = ref(false)
function toggleInput(value: boolean) {
  viewInput.value = value
}

const viewDependants = ref(false)
function toggleDependants(value: boolean) {
  viewDependants.value = value
}

const viewOutput = ref(false)
function toggleOutput(value: boolean) {
  viewOutput.value = value
}
</script>

<template>
  <Layout>
    <template #left>
      <Fields @focus-change="handleFocusChange" />
    </template>

    <template #right>
      <Input v-if="viewInput" />
      <Dependants v-if="viewDependants" />
      <ResolveOutput v-if="viewOutput" />
      <CategorizedNodes v-if="viewCategories" />
      <JsonTree v-if="viewJson" />
    </template>

    <template #controls>
      <Controls
        @toggle-json="toggleJsonView"
        @toggle-categories="toggleCategories"
        @toggle-input="toggleInput"
        @toggle-dependants="toggleDependants"
        @toggle-output="toggleOutput"
       />

      <Card>
        <template #title>
          Information
        </template>

        <template #content>
          <article class="prose">
            <ul>
              <li>Start by adding a new field.</li>
              <li>Type `=` to create a new formula.</li>
              <li>Methods like MAX() will accept parameters.</li>
              <li>References to other fields can be achieved using the $ syntax.</li>
              <li>Focus on a field to see the break down of the formula.</li>
            </ul>

            <h4>Examples</h4>

            <pre><code>=$input.age * $node.value</code></pre>
            <pre><code>=func_party(nest1(100), 2, 4 / 2, nest2(42, 69, 'nice'), 'string', true)</code></pre>
          </article>
        </template>
      </Card>
    </template>
  </Layout>
</template>
