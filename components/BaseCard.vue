<template>
  <div class="flex mt-4 pt-0 max-w-sm w-full flex-col flex-shrink-0 shadow-inner-white flex-nowrap border border-dark-lighter rounded justify-between">
    <div>
      <BaseTag class="ml-4 -translate-y-4"> <slot name="icon"></slot> {{ title }} </BaseTag>

      <div class="p-4 pt-0">
        <slot></slot>
      </div>
    </div>

    <div class="bg-stripes bg-stripe w-full h-3 rounded"></div>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'BaseCard',

    props: {
      title: {
        type: String,
        required: true,
      },
    },
  });
</script>
