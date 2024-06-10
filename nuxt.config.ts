// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  routeRules: {
    '/x': { redirect: { to: 'https://x.com/rangesaur', statusCode: 301 } },
    '/github': { redirect: { to: 'https://github.com/RangerDigital', statusCode: 301 } },
  },

  modules: ['nuxt-svgo', '@nuxtjs/sitemap', '@nuxt/content', "nuxt-simple-robots"],
  svgo: {
    defaultImport: 'component',
  },
  content: {
    highlight: {
      theme: 'github-dark',
    },
  },
});