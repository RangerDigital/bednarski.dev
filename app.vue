<template>
  <NuxtLayout />
</template>

<script setup lang="ts">
  useHead({
    title: 'Jakub Bednarski | Design Software Engineer',
    link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    meta: [
      {
        name: 'description',
        content: 'Software Engineer who loves building visually pleasing products. Loves Python, Vue.js, Linux, and Open Source software. Drop me a message!',
      },
      { name: 'author', content: 'Jakub Bednarski' },
      { name: 'theme-color', content: '#070707' },
    ],
  });
</script>
