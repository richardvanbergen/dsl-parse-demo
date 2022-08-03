<template>
  <div  :class="[$slots.center ? 'grid-cols-3' : 'grid-cols-2', 'bg-neutral-100 p-4 h-screen min-w-full lg:grid grid-rows-3 gap-4']" class="">
    <div class="bg-white col-span-1 row-span-3 drop-shadow-lg">
      <div class="h-full overflow-y-auto overflow-x-visible p-6 flex flex-col gap-10">
        <div class="flex-1">
          <slot name="left" />
        </div>

        <article class="prose">
          <h3>Basic Info</h3>
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
      </div>
    </div>

    <div class="p-6 bg-white col-span-1 row-span-3 gap-4 drop-shadow-lg" v-if="$slots.center">
      <div class="h-full overflow-y-auto overflow-x-visible">
        <slot name="center" />
      </div>
    </div>

    <div class="overflow-y-auto overflow-x-visible row-span-3">
      <slot name="right" />
    </div>
  </div>
</template>

