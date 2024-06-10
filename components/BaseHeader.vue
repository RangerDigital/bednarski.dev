<template>
  <div class="flex flex-row justify-center items-center w-full text-white">
    <div class="flex flex-col gap-1 xl:gap-4 items-center">
      <p class="text-base xl:text-xl opacity-20">{{ subtitle }}</p>

      <h3 class="font-headings text-xl xl:text-5xl font-medium"> <slot></slot></h3>
    </div>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'BaseHeader',

    props: {
      subtitle: {
        type: String,
        required: true,
      },
    },
  });
</script>
