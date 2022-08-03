<template>
  <div class="bg-white shadow overflow-hidden rounded-md mb-4">
    <div class="divide-y divide-gray-200">
      <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          <slot name="title" />
        </h3>
      </div>

      <div class="divide-y divide-gray-200" v-if="$slots.content">
        <div class="relative bg-white py-5 px-4 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
          <slot name="content" />
        </div>
      </div>
    </div>
  </div>
</template>
