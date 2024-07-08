<template>
  <ContentDoc class="flex flex-col gap-5 markdown" :class="{ 'no-hover': disableInteractivity }" />
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'MarkdownContentRendered',

    props: {
      disableInteractivity: {
        type: Boolean,
        default: false,
      },
    },
  });
</script>

<style>
  .markdown h1 {
    @apply text-4xl font-semibold font-headings mt-4 leading-relaxed;
  }

  .markdown h2 {
    @apply text-2xl font-semibold font-headings mt-4;
  }

  .markdown h3 {
    @apply text-xl font-semibold font-headings mt-4;
  }

  .markdown h4 {
    @apply text-lg font-semibold font-headings mt-4;
  }

  .markdown h5 {
    @apply text-base font-semibold font-headings mt-4;
  }

  .markdown h6 {
    @apply text-sm font-semibold font-headings mt-4;
  }

  .markdown p {
    @apply text-base;
  }

  .markdown ul {
    @apply list-disc list-inside;
  }

  .markdown ol {
    @apply list-decimal list-inside;
  }

  .markdown li {
    @apply text-base;
  }

  .markdown blockquote {
    @apply border-l-4 border-gray-300 pl-4;
  }

  .markdown pre {
    @apply bg-dark-light p-4 rounded;
  }

  .markdown code {
    @apply font-mono text-sm;
  }

  .markdown table {
    @apply w-full border-collapse;
  }

  .markdown img {
    @apply w-full rounded shadow-inner border border-dark-lighter xl:cursor-pointer transition-transform duration-150 ease-in-out xl:hover:scale-125;
  }

  .no-hover img {
    @apply xl:hover:scale-100;
  }
</style>
