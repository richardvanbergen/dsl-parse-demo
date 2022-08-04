<template>
  <div class="bg-neutral-100 p-4 h-screen flex justify-center">
    <div class="max-w-[120rem] flex gap-4 flex-1">
      <div class="overflow-y-auto flex-1">
        <slot name="left" />
      </div>

      <div class="overflow-y-auto flex-1">
        <slot name="right" />
      </div>

      <div class="overflow-y-auto basis-1/4">
        <slot name="controls" />
      </div>
    </div>
  </div>
</template>

