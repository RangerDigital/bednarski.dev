<template>
  <BaseCard v-if="data" :title="title" @click="openRepository" class="cursor-pointer">
    <p>{{ data?.description }}</p>
    <p class="text-xs mt-2"> {{ data?.license?.name }}</p>

    <div class="flex flex-row justify-end w-full">
      <BaseTag class="mt-2 text-xs"> {{ data?.stargazers_count }} ⭐ Stars </BaseTag>
    </div>
  </BaseCard>
</template>

<script>
  import BaseCard from './BaseCard.vue';
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'GitHubCard',
    components: {
      BaseCard,
    },

    props: {
      repository: {
        type: String,
        required: true,
      },
      owner: {
        type: String,
        required: true,
      },
    },

    data() {
      return {
        loading: true,
        data: null,
      };
    },

    computed: {
      title() {
        return this.data?.full_name ? this.data.full_name.charAt(0).toUpperCase() + this.data.full_name.slice(1) : '';
      },
    },

    methods: {
      openRepository() {
        window.open(`https://github.com/${this.owner}/${this.repository}`, '_blank');
      },
    },

    async mounted() {
      try {
        const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repository}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        this.data = await response.json();
      } catch (error) {
        console.error('Error fetching repository:', error);
      } finally {
        this.loading = false;
      }
    },
  });
</script>
