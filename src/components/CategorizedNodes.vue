<script lang="ts" setup>
import { storeToRefs } from "pinia"
import { isPrimitive, isGrammarType, ParsedFunction, ParsedReference, ParsedGrammar } from "../grammar/parser"
import { compileReference } from "../grammar/compile"
import {useFieldStore} from "../stores/useFieldStore"
import Card from "./Card.vue";

const fieldStore = useFieldStore()
const { categorizedNodes } = storeToRefs(fieldStore)

function isParsedFunction(node: ParsedGrammar): node is ParsedFunction {
  return isGrammarType<ParsedFunction>(node, 'function')
}

function isParsedReference(node: ParsedGrammar): node is ParsedReference {
  return isGrammarType<ParsedReference>(node, 'reference')
}

const colorMap = {
  'formula': 'bg-blue-500',
  'arithmetic': 'bg-green-500',
  'primitive': 'bg-yellow-500',
  'reference': 'bg-orange-500',
  'function': 'bg-purple-500',
}
</script>

<template>
  <Card>
    <template #title>
      Categorized Nodes
    </template>

    <template #content>
      <ul role="list" class="grid grid-cols-1 gap-5 sm:gap-4 sm:grid-cols-2">
        <li v-for="(nodes, type) of Object.fromEntries(categorizedNodes)" :key="type" class="col-span-1 flex shadow-sm rounded-md">
          <div :class="[colorMap[type] ?? 'bg-gray-500', 'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md']">
            {{ type.at(0).toLocaleUpperCase() }}
          </div>

          <div class="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
            <div class="flex-1 px-4 py-2 text-sm truncate">
              <p class="text-gray-900 font-medium hover:text-gray-600 capitalize">{{ type }} values</p>
              <p class="text-gray-500">
                <template v-if="type === 'formula'">
                  {{ nodes.length }} Formula
                </template>

                <template v-if="type === 'arithmetic'">
                  {{ nodes.length }} Arithmetic
                </template>

                <template v-else v-for="(node, key) of nodes" :key="key">
                  <span v-if="isPrimitive(node)">
                    {{ node.value }}
                  </span>

                  <span v-if="isParsedFunction(node)">
                    {{ node.value.name }}
                  </span>

                  <span v-if="isParsedReference(node)">
                    {{ compileReference(node, { input: { age: 255 } }) }}
                  </span>

                  <span v-if="key !== nodes.length - 1">, </span>
                </template>
              </p>
            </div>
          </div>
        </li>
      </ul>
    </template>
  </Card>
</template>
