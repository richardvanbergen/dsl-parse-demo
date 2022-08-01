<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { isPrimitive, isGrammarType, ParsedFunction, ParsedReference, ParsedGrammar } from "../grammar/parser";
import {useFieldStore} from "../stores/useFieldStore";

const fieldStore = useFieldStore()
const { categorizedNodes } = storeToRefs(fieldStore)

function isParsedFunction(node: ParsedGrammar): node is ParsedFunction {
  return isGrammarType<ParsedFunction>(node, 'function')
}

function isParsedReference(node: ParsedGrammar): node is ParsedReference {
  return isGrammarType<ParsedReference>(node, 'reference')
}

function referenceNodeToString(reference: ParsedReference) {
  let combine = [reference.value.identifier]
  if (reference.value.subpath && reference.value.subpath.length > 0) {
    combine = [...combine, ...reference.value.subpath]
  }

  return combine
}
</script>

<template>
  <div class="bg-white shadow overflow-hidden rounded-md">
    <div class="divide-y divide-gray-200">
      <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Categorized AST Nodes</h3>
      </div>

      <template v-for="(nodes, type) of Object.fromEntries(categorizedNodes)">
        <div v-if="type !== 'formula' && type !== 'arithmetic'" class="divide-y divide-gray-200">
          <div class="relative bg-white py-5 px-4 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
            <h4 class="text-lg leading-6 font-medium text-gray-500 capitalize mb-2">
              {{ type }}
            </h4>

            <ul>
              <template v-for="node of nodes">
                <li v-if="isPrimitive(node)">
                  {{ node.value }}
                </li>

                <li v-if="isParsedFunction(node)">
                  {{ node.value.name }}
                </li>

                <li v-if="isParsedReference(node)">
                  {{ referenceNodeToString(node) }}
                </li>
              </template>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
