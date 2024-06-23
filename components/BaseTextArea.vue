<template>
  <div class="flex flex-col w-full">
    <label class="block text-sm mb-2">
      {{ label }}
    </label>

    <textarea
      :value="modelValue"
      rows="8"
      :placeholder="placeholder"
      class="w-full rounded border border-dark-lighter bg-dark text-white px-5 py-3 focus:ring-primary focus:border-primary placeholder:text-dark-lighter transition-all duration-200 ease-in-out"
      :class="{ '!border-primary': error }"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>

    <span v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</span>
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
