<template>
  <div class="relative inline-flex group w-full xl:w-min">
    <div
      class="absolute transition-all duration-500 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-md blur-lg opacity-35 group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-100 animate-tilt animate-breath"
    ></div>

    <button
      class="relative inline-flex items-center justify-center px-10 py-3 text-sm font-medium shadow-inner-white font-headings border-dark-lighter text-white bg-dark-light rounded-md w-full xl:w-min border outline-none leading-tight whitespace-nowrap transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
    >
      <slot></slot>
    </button>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';
  export default defineComponent({ name: 'BaseButton' });
</script>

<style scoped>
  @keyframes breath {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.35;
      filter: blur(8px);
    }
    50% {
      transform: scale(1.08);
      opacity: 1;
      filter: blur(12px);
    }
  }

  .animate-breath {
    animation: breath 5s ease-in-out infinite;
  }
</style>
