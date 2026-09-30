<template>
  <details :open="open" class="group rounded border border-dark-lighter bg-dark-light/30">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 select-none [&::-webkit-details-marker]:hidden">
      <span class="font-headings text-sm text-white">{{ title }}</span>

      <span class="flex items-center gap-2">
        <span v-if="note" class="text-[11px] text-white/35">{{ note }}</span>

        <svg class="h-3.5 w-3.5 shrink-0 text-white/40 transition-transform duration-200 group-open:rotate-180" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </summary>

    <div class="flex flex-col gap-4 border-t border-dark-lighter px-4 pt-4 pb-4">
      <slot></slot>
    </div>
  </details>
</template>

<script setup>
  defineProps({
    title: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    open: {
      type: Boolean,
      default: false,
    },
  });
</script>
