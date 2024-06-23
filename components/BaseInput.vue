<template>
  <div class="flex flex-col w-full">
    <label class="block text-sm mb-2">
      {{ label }}
    </label>

    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full rounded border border-dark-lighter bg-dark text-white px-5 py-3 focus:ring-primary focus:border-primary placeholder:text-dark-lighter transition-all duration-200 ease-in-out"
      :class="{ '!border-primary': error }"
    />

    <span v-if="error" class="text-primary text-sm mt-2">{{ error }}</span>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'BaseInput',

    props: {
      label: {
        type: String,
        required: true,
      },
      modelValue: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        default: 'text',
      },
      placeholder: {
        type: String,
        default: '',
      },
      error: {
        type: String,
        default: '',
      },
    },
  });
</script>
