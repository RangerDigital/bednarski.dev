import getRoutes from './utils/getRoutes';
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
    '/sponsor': { redirect: { to: 'https://ostrowiec.praca.gov.pl/', statusCode: 301 } },
  },

  modules: ['nuxt-svgo', '@nuxtjs/sitemap', '@nuxt/content', 'nuxt-simple-robots'],
  svgo: {
    defaultImport: 'component',
  },
  sitemap: {
    routes() {
      return getRoutes();
    },
  },

  app: {
    head: {
      title: 'Jakub Bednarski | Full-Stack Design Engineer',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'description',
          name: 'description',
          content: 'Jakub Bednarski is a Full-Stack Design Engineer based in Rzeszów, Poland.',
        },
      ],
      script: [
        {
          src: 'https://umami.bednarski.dev/script.js',
          defer: true,
          'data-website-id': '950e9ed9-1090-486e-84a0-420058729335',
        },
      ],
    },
  },
  content: {
    documentDriven: true,
    contentHead: false,
    highlight: {
      theme: 'github-dark',
    },
  },
});
