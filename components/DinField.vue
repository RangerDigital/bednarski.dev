<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-baseline justify-between gap-3">
      <span class="text-xs leading-snug text-white/70">{{ label }}</span>
      <span class="shrink-0 text-[10px] uppercase tracking-wider text-white/30">{{ unit }}</span>
    </div>

    <input
      type="number"
      inputmode="decimal"
      :aria-label="label"
      :value="text"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="w-full rounded border bg-dark px-3 py-2 text-sm text-white transition-colors duration-200 focus:ring-1 focus:outline-none placeholder:text-white/25 disabled:cursor-not-allowed disabled:opacity-50"
      :class="error ? 'border-primary focus:border-primary focus:ring-primary' : 'border-dark-lighter focus:border-primary focus:ring-primary'"
      @input="onInput"
      @blur="onBlur"
    />

    <input
      v-if="slider && Number.isFinite(min) && Number.isFinite(max)"
      type="range"
      :aria-label="`${label} slider`"
      :min="min"
      :max="max"
      :step="step"
      :value="rangeValue"
      :disabled="disabled"
      class="h-1 w-full cursor-pointer appearance-none rounded bg-dark-lighter accent-primary disabled:cursor-not-allowed disabled:opacity-50"
      @input="onRange"
    />

    <p v-if="hint" class="text-[11px] leading-snug text-white/35">{{ hint }}</p>
    <p v-if="error" class="text-[11px] leading-snug text-primary">{{ error }}</p>
  </div>
</template>

<script setup>
  import { ref, watch, computed } from 'vue';

  const props = defineProps({
    label: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Number,
      default: NaN,
    },
    min: {
      type: Number,
      default: undefined,
    },
    max: {
      type: Number,
      default: undefined,
    },
    step: {
      type: Number,
      default: 0.1,
    },
    unit: {
      type: String,
      default: 'mm',
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
    slider: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const format = (value) => (Number.isFinite(value) ? String(value) : '');

  // Local text draft so partial input like "12." is not rewritten while typing.
  const text = ref(format(props.modelValue));

  watch(
    () => props.modelValue,
    (value) => {
      if (!Number.isFinite(value)) return;
      if (Number(text.value) !== value) text.value = format(value);
    }
  );

  const rangeValue = computed(() => (Number.isFinite(props.modelValue) ? props.modelValue : props.min));

  function onInput(event) {
    const raw = event.target.value;
    text.value = raw;
    emit('update:modelValue', raw.trim() === '' ? NaN : Number(raw));
  }

  function onBlur() {
    text.value = format(props.modelValue);
  }

  function onRange(event) {
    emit('update:modelValue', Number(event.target.value));
  }
</script>

<style scoped>
  /* Denser fields: the native number spinners waste space in the parameter rail. */
  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    margin: 0;
    -webkit-appearance: none;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }
</style>
