<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-baseline justify-between gap-3">
      <span class="text-xs leading-snug text-white/70">{{ label }}</span>
    </div>

    <select
      :aria-label="label"
      :value="String(modelValue)"
      :disabled="disabled"
      class="w-full rounded border bg-dark px-3 py-2 text-sm text-white transition-colors duration-200 focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      :class="error ? 'border-primary focus:border-primary focus:ring-primary' : 'border-dark-lighter focus:border-primary focus:ring-primary'"
      @change="onChange"
    >
      <option v-for="option in options" :key="String(option.value)" :value="String(option.value)">{{ option.label }}</option>
    </select>

    <p v-if="hint" class="text-[11px] leading-snug text-white/35">{{ hint }}</p>
    <p v-if="error" class="text-[11px] leading-snug text-primary">{{ error }}</p>
  </div>
</template>

<script setup>
  const props = defineProps({
    label: {
      type: String,
      required: true,
    },
    modelValue: {
      type: [String, Number],
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
    hint: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:modelValue']);

  function onChange(event) {
    const raw = event.target.value;
    const match = props.options.find((option) => String(option.value) === raw);
    emit('update:modelValue', match ? match.value : raw);
  }
</script>
