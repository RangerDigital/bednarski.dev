<template>
  <footer class="flex bg-dark flex-row justify-center xl:justify-end p-2.5 px-4 border-t border-dark-light w-full text-white fixed bottom-0 gap-8">
    <p class="text-xs xl:text-sm">Jakub Bednarski © {{ currentYear }} ALL RIGHTS RESERVED </p>
  </footer>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'BaseFooter',

    computed: {
      currentYear() {
        return new Date().getFullYear();
      },
    },
  });
</script>
