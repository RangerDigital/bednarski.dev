<template>
  <DinSelect v-if="field.options" v-model="value" :label="field.label" :options="field.options" :hint="field.hint" :error="error" />

  <DinField
    v-else
    v-model="value"
    :label="field.label"
    :unit="field.unit ?? 'mm'"
    :min="min"
    :max="max"
    :step="field.step"
    :slider="Boolean(field.slider)"
    :hint="field.hint"
    :error="error"
  />
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    field: {
      type: Object,
      required: true,
    },
    modelValue: {
      type: [String, Number],
      default: undefined,
    },
    min: {
      type: Number,
      default: undefined,
    },
    max: {
      type: Number,
      default: undefined,
    },
    error: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const value = computed({
    get: () => props.modelValue,
    set: (next) => emit('update:modelValue', next),
  });
</script>
