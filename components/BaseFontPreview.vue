<template>
  <div class="flex flex-col gap-4">
    <p>{{ name }}</p>

    <h4 class="font-bold text-2xl">Heading 1</h4>

    <h4 class="font-bold text-xl">Heading 2</h4>

    <h4 class="font-bold text-lg">Heading 3</h4>

    <h4 class="font-semibold text-2xl">Subheading 1</h4>

    <h4 class="font-semibold text-xl">Subheading 2</h4>

    <h4 class="font-semibold text-lg">Subheading 3</h4>

    <h4 class="font-normal text-2xl">Body 1</h4>

    <h4 class="font-normal text-xl">Body 2</h4>

    <h4 class="font-normal text-lg">Body 3</h4>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'BaseFontPreview',

    props: {
      name: {
        type: String,
        required: true,
      },
    },
  });
</script>
