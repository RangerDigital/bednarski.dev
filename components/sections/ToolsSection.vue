<template>
  <section class="my-12 flex flex-col flex-nowrap">
    <BaseHeader subtitle="Tools & Software"> My Tech Arsenal</BaseHeader>

    <div class="flex xl:flex-row flex-col xl:flex-wrap gap-0 xl:gap-4 justify-center mt-6">
      <img src="/img/vue-uwu.png" alt="Vue.js Logo" class="xl:w-1/5 flex-shrink-0 -rotate-12" />

      <img src="/img/node-uwu.png" alt="Node.js Logo" class="xl:w-1/5 flex-shrink-0" />

      <img src="/img/tailwind-uwu.png" alt="Tailwind CSS Logo" class="xl:w-1/5 flex-shrink-0 rotate-12" />
    </div>

    <div class="flex flex-row flex-wrap gap-4 justify-center mt-6">
      <p class="max-w-prose xl:text-center">
        Staying at the cutting edge, I constantly integrate innovative tools to supercharge development and maximize efficiency. My daily tech stack includes:
      </p>
    </div>

    <div class="flex flex-row justify-center">
      <div class="flex flex-row flex-wrap gap-2 xl:gap-3 justify-center mt-6 max-w-3xl">
        <BaseTag> Vue.js</BaseTag>
        <BaseTag> Nuxt.js</BaseTag>
        <BaseTag> Tailwind CSS</BaseTag>
        <BaseTag> TypeScript</BaseTag>
        <BaseTag> Nest.js</BaseTag>
        <BaseTag> Fastify.js</BaseTag>
        <BaseTag> Docker</BaseTag>
        <BaseTag> MongoDB</BaseTag>
        <BaseTag> PostgreSQL</BaseTag>
        <BaseTag> Figma</BaseTag>
        <BaseTag> Cloudflare</BaseTag>
        <BaseTag> Redis</BaseTag>
        <BaseTag> GitHub Actions</BaseTag>
        <BaseTag> GitHub Copilot</BaseTag>
        <BaseTag> VS Code</BaseTag>
      </div>
    </div>
  </section>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'ToolsSection',
  });
</script>
