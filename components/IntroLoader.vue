<template>
  <section class="w-full h-screen fixed flex flex-row items-center justify-center overflow-hidden bg-dark z-10" id="intro-loader" @click="$emit('animation-complete')">
    <section class="grid grid-cols-1 grid-rows-1">
      <div class="flex flex-col justify-between gap-8 col-start-1 row-start-1 text-white text-2xl">
        <div class="flex flex-row justify-between">
          <p class="intro-cross opacity-0">+</p>
          <p class="intro-cross opacity-0">+</p>
        </div>

        <div class="flex flex-row justify-between">
          <p class="intro-cross opacity-0">+</p>
          <p class="intro-cross opacity-0">+</p>
        </div>
      </div>

      <!-- Slot Machine -->
      <div class="flex flex-row gap-8 items-center col-start-1 row-start-1 p-4 py-8 xl:p-16">
        <div class="overflow-hidden h-20 w-20 lg:h-48 lg:w-48 intro-slot"> </div>
        <div class="overflow-hidden h-20 w-20 lg:h-48 lg:w-48 intro-slot"> </div>
        <div class="overflow-hidden h-20 w-20 lg:h-48 lg:w-48 intro-slot"> </div>
      </div>
    </section>
  </section>
</template>

<script>
  import { defineComponent } from 'vue';
  import anime from 'animejs/lib/anime.es.js';

  export default defineComponent({
    name: 'IntroLoader',

    methods: {
      startAnimation() {
        anime({
          targets: '.intro-slot',
          delay: anime.stagger(200),
          backgroundPosition: '0 700%',
          filter: ['blur(0px)', 'blur(1px)', 'blur(0px)'],
          duration: 1000,
          easing: 'easeInOutQuart',
        });

        anime({
          targets: '.intro-cross',
          delay: anime.stagger(200),
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 200,
          easing: 'easeInOutSine',
        });

        anime({
          targets: '.intro-slot',
          delay: 1800,
          opacity: 0,
          translateY: 50,
          duration: 200,
          filter: ['blur(0px)', 'blur(1px)'],
          easing: 'easeInOutSine',
        });

        anime({
          targets: '#intro-loader',
          opacity: 0,
          duration: 300,
          delay: 2000,
          easing: 'easeOutSine',
          complete: () => {
            document.body.style.overflow = 'auto';

            this.$emit('animation-complete');
          },
        });
      },
    },

    mounted() {
      // disable scrolling
      document.body.style.overflow = 'hidden';

      this.startAnimation();
    },
  });
</script>

<style scoped>
  .intro-slot {
    background: url('~/assets/icons/loader-slot.svg');
    background-repeat: repeat-y;
    background-size: cover;
  }
</style>
