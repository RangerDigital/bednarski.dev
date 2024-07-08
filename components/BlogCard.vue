<template>
  <section class="w-full max-w-xl rounded h-96 overflow-hidden border border-dark-lighter cursor-pointer shadow-inner-white">
    <div class="absolute flex flex-row gap-5 items-center p-2 border-b border-dark-lighter" :style="{ width: componentWidth + 'px' }">
      <div class="flex flex-row gap-2">
        <!-- apple os colors -->
        <div class="w-3 h-3 rounded-full bg-[#28c83c]"> </div>
        <div class="w-3 h-3 rounded-full bg-[#ff9f0a]"> </div>
        <div class="w-3 h-3 rounded-full bg-[#ff3b30]"> </div>
      </div>

      <p class="text-xs">{{ title }}</p>
    </div>

    <div class="p-4 px-0 h-96">
      <slot></slot>
    </div>
  </section>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'BlogCard',

    props: {
      title: {
        type: String,
        required: true,
      },
    },

    data() {
      return {
        componentWidth: 0,
      };
    },

    mounted() {
      this.componentWidth = this.$el.offsetWidth;
    },
  });
</script>
