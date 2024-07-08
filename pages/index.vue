<template>
  <HeroSection />

  <ToolsSection class="mt-28" />

  <ContactSection class="xl:mt-32" />

  <ArticlesSection class="xl:mt-32" />

  <ServicesSection class="xl:mt-32" />
</template>

<script>
  import { defineComponent } from 'vue';
  import ContactSection from '~/components/sections/ContactSection.vue';
  import HeroSection from '~/components/sections/HeroSection.vue';
  import ArticlesSection from '~/components/sections/ArticlesSection.vue';
  import ToolsSection from '~/components/sections/ToolsSection.vue';
  import ServicesSection from '~/components/sections/ServicesSection.vue';

  export default defineComponent({
    name: 'Home',
    components: {
      HeroSection,
      ContactSection,
      ArticlesSection,
      ToolsSection,
      ServicesSection,
    },

    created() {
      useHead({
        title: 'Jakub Bednarski | Full-Stack Design Engineer',
        meta: [
          {
            name: 'description',
            content: 'Jakub Bednarski is a Full-Stack Design Engineer based in Rzeszów, Poland.',
          },
        ],
      });
    },
  });
</script>
