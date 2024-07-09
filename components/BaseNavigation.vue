<template>
  <nav class="hidden xl:flex bg-dark justify-between flex-row p-4 px-4 border-b border-dark-light w-full text-white absolute top-0 gap-4">
    <div class="flex flex-row gap-4 items-center" @mouseover="isHovered = true" @mouseleave="isHovered = false">
      <LogoIcon
        class="h-5 w-5 scale-110 cursor-pointer opacity-85 hover:opacity-100 duration-200 ease-in-out transition-all animate-spin-slow [animation-play-state:paused] hover:[animation-play-state:running]"
        @click="$router.push('/')"
      />

      <p class="text-sm cursor-pointer transition-all duration-500 ease-in-out" :class="{ 'opacity-100': isHovered, 'opacity-0': !isHovered }"> Go Back </p>
    </div>
  </nav>
</template>

<script>
  import { defineComponent } from 'vue';
  import LogoIcon from '@/assets/icons/logo.svg';

  export default defineComponent({
    name: 'BaseNavigation',

    components: {
      LogoIcon,
    },

    data() {
      return {
        isHovered: false,
      };
    },
  });
</script>
