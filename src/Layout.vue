<template>
  <div class="bg-neutral-100 p-4 min-h-screen min-w-full lg:grid grid-cols-3 grid-rows-3 gap-4">
    <div class="p-6 bg-white col-span-1 row-span-3 flex flex-col gap-4 drop-shadow-lg">
      <slot name="left" />
    </div>

    <div class="p-6 bg-white col-span-1 row-span-3 gap-4 drop-shadow-lg">
      <slot name="center" />
    </div>

    <div class="p-6 bg-white col-span-1 row-span-1 gap-4 drop-shadow-lg">
      <slot name="right-1" />
    </div>

    <div class="p-6 bg-white col-span-1 row-span-1 gap-4 drop-shadow-lg">
      <slot name="right-2" />
    </div>

    <div class="p-6 bg-white col-span-1 row-span-1 gap-4 drop-shadow-lg">
      <slot name="right-3" />
    </div>
  </div>
</template>

