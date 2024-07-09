<template>
  <div
    class="flex flex-row gap-3 w-min text-center align-middle justify-center flex-shrink-0 whitespace-nowrap shadow-inner-white flex-nowrap items-center px-5 py-1.5 bg-dark-light border border-dark-lighter rounded-full text-sm"
  >
    <slot></slot>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'BaseTag',
  });
</script>
