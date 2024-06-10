<template>
  <nav class="hidden xl:flex bg-dark justify-between flex-row p-4 px-4 border-b border-dark-lighter w-full border-dashed text-white absolute top-0 gap-4">
    <LogoIcon class="h-5 w-5 scale-110 cursor-pointer" @click="$router.push('/')" />

    <p class="text-sm">Contact Me</p>
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
  });
</script>
