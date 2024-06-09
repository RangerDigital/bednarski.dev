<template>
  <IntroLoader @animation-complete="handleAnimationComplete" v-if="!isIntroLoaderComplete" />

  <section class="bg-dark text-white min-h-screen w-screen p-6 xl:p-20 flex flex-col justify-between">
    <NuxtPage />
  </section>
  <BaseFooter />
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'DefaultLayout',

    data() {
      return {
        isIntroLoaderComplete: false,
      };
    },

    methods: {
      handleAnimationComplete() {
        this.isIntroLoaderComplete = true;
      },
    },
  });
</script>
