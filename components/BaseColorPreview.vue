<template>
  <div class="flex flex-col items-center">
    <div class="w-56 h-32 rounded grid grid-cols-1 grid-rows-1 cursor-pointer" :style="{ backgroundColor: color }" @mouseover="isHovered = true" @mouseleave="isHovered = false">
      <div class="flex flex-col justify-end col-start-1 row-start-1 z-10 backdrop-blur-md w-full h-full p-4" v-if="isHovered">
        <p class="text-xs">Click to Copy</p>
      </div>

      <div class="flex flex-col justify-end col-start-1 row-start-1 p-4">
        <p class="mt-2">{{ name }}</p>

        <p class="text-sm mt-2">{{ color }}</p>

        <p class="text-xs mt-2">{{ rgbColor }}</p>
      </div>
    </div>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'BaseColorPreview',
    props: {
      name: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
    },

    data() {
      return {
        isHovered: false,
      };
    },
    computed: {
      rgbColor() {
        return this.hexToRgb(this.color);
      },
    },

    methods: {
      hexToRgb(hex) {
        const bigint = parseInt(hex.substring(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `rgb(${r}, ${g}, ${b})`;
      },

      copyColor() {
        navigator.clipboard.writeText(this.color);
      },
    },
  });
</script>
