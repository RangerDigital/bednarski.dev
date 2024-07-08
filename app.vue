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

      // Open Graph
      { property: 'og:title', content: 'Jakub Bednarski | Design Software Engineer' },
      {
        property: 'og:description',
        content: 'Software Engineer who loves building visually pleasing products. Loves Python, Vue.js, Linux, and Open Source software. Drop me a message!',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://bednarski.dev' },
      { property: 'og:image', content: 'https://bednarski.dev/img/og-image.png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Jakub Bednarski | Design Software Engineer' },
    ],
  });
</script>
