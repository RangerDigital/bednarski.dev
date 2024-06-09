<template>
  <section class="w-screen h-screen flex flex-row items-center justify-center overflow-hidden absolute bg-dark z-10" id="intro-loader">
    <section class="grid grid-cols-1 grid-rows-1 scale-50 xl:scale-100">
      <div class="flex flex-row gap-8 items-center col-start-1 row-start-1 z-10 justify-center"> </div>

      <div class="flex flex-row gap-8 items-center col-start-1 row-start-1">
        <div class="overflow-hidden h-48 w-48 intro-slot" id="intro-slot-1"> </div>

        <div class="overflow-hidden h-48 w-48 intro-slot" id="intro-slot-2"> </div>

        <div class="overflow-hidden h-48 w-48 intro-slot" id="intro-slot-3"> </div>
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
        // Slot Machine Effect

        anime({
          targets: '#intro-slot-1',
          delay: 0,
          backgroundPosition: '0 380%',
          duration: 1200,
          easing: 'easeInOutSine',
        });

        anime({
          targets: '#intro-slot-2',
          delay: 100,
          backgroundPosition: '0 190%',
          duration: 1200,
          easing: 'easeInOutSine',
        });

        anime({
          targets: '#intro-slot-3',
          delay: 200,
          backgroundPosition: '0 380%',
          duration: 1200,
          easing: 'easeInOutSine',
        });

        anime({
          targets: '#intro-loader',
          opacity: 0,
          duration: 200,
          delay: 2000,
          easing: 'easeOutSine',
          complete: () => {
            this.$emit('animation-complete');
          },
        });
      },
    },

    mounted() {
      this.startAnimation();
    },
  });
</script>

<style scoped>
  .intro-slot {
    background: url('~/assets/icons/loader-slot.svg');
    background-repeat: repeat-y;
  }
</style>
