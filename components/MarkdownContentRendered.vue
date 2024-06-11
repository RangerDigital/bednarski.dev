<template>
  <ContentDoc class="flex flex-col gap-3 markdown" />
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'MarkdownContentRendered',
  });
</script>

<style>
  .markdown h1 {
    @apply text-4xl font-semibold font-headings;
  }

  .markdown h2 {
    @apply text-2xl font-semibold font-headings;
  }

  .markdown h3 {
    @apply text-xl font-semibold font-headings;
  }

  .markdown h4 {
    @apply text-lg font-semibold font-headings;
  }

  .markdown h5 {
    @apply text-base font-semibold font-headings;
  }

  .markdown h6 {
    @apply text-sm font-semibold font-headings;
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
    @apply bg-dark-light p-4 rounded-md;
  }

  .markdown code {
    @apply font-mono text-sm;
  }

  .markdown table {
    @apply w-full border-collapse;
  }
</style>
