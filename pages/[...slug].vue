<template>
  <section class="flex flex-col justify-center items-center">
    <div class="max-w-2xl w-full">
      <ContentDoc class="flex flex-col gap-3" />
    </div>
  </section>
</template>

<style>
  h1 {
    @apply text-4xl font-semibold font-headings;
  }

  h2 {
    @apply text-2xl font-semibold font-headings;
  }

  h3 {
    @apply text-xl font-semibold font-headings;
  }

  h4 {
    @apply text-lg font-semibold font-headings;
  }

  h5 {
    @apply text-base font-semibold font-headings;
  }

  h6 {
    @apply text-sm font-semibold font-headings;
  }

  p {
    @apply text-base;
  }

  ul {
    @apply list-disc list-inside;
  }

  ol {
    @apply list-decimal list-inside;
  }

  li {
    @apply text-base;
  }

  blockquote {
    @apply border-l-4 border-gray-300 pl-4;
  }

  pre {
    @apply bg-dark-light p-4 rounded-md;
  }

  code {
    @apply font-mono text-sm;
  }

  table {
    @apply w-full border-collapse;
  }
</style>
