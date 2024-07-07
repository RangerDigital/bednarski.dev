<template>
  <section class="my-12 flex flex-col flex-nowrap items-center">
    <BaseHeader subtitle="Content Section">Articles</BaseHeader>

    <div
      class="flex flex-col xl:flex-row gap-8 xl:gap-28 justify-center mt-8 flex-nowrap w-full"
      v-if="activeArticle"
      @mouseenter="pauseArticleInterval = true"
      @mouseleave="pauseArticleInterval = false"
    >
      <div class="flex flex-col w-full xl:w-96 xl:ml-64 items-center xl:items-start">
        <div class="flex flex-row gap-2 items-center border-b pb-6 border-dark-light w-full justify-center xl:justify-start">
          <div class="rounded-full bg-dark-light w-8 h-1 transition-all duration-100 ease-in-out" :class="{ 'bg-dark-lighter !w-14': activeArticleIndex === 0 }"></div>
          <div class="rounded-full bg-dark-light w-8 h-1 transition-all duration-100 ease-in-out" :class="{ 'bg-dark-lighter !w-14': activeArticleIndex === 1 }"></div>
          <div class="rounded-full bg-dark-light w-8 h-1 transition-all duration-100 ease-in-out" :class="{ 'bg-dark-lighter !w-14': activeArticleIndex === 2 }"></div>
        </div>

        <div class="w-full max-w-sm animate-fade-in-right" :key="activeArticle._id" :class="{ '!animate-fade-out-right': runAnimation }">
          <p class="opacity-50 text-sm mb-2 mt-4"> {{ formatDate(activeArticle.date) }} </p>

          <h3 class="font-headings text-4xl font-semibold">{{ activeArticle.title }}</h3>
          <p class="mt-4">{{ activeArticle.description }}</p>

          <div class="flex flex-row gap-2 mt-6">
            <BaseTag v-for="tag in activeArticle.tags" :key="tag"> {{ tag }}</BaseTag>
          </div>
        </div>
      </div>

      <BlogCard :title="activeArticle._path">
        <MarkdownContentRendered
          :disableInteractivity="true"
          @click="$router.push(activeArticle._path)"
          :class="{ 'blur-md': runAnimation }"
          class="p-4 scale-75 -translate-y-6 h-full w-full blur-xs hover:blur-none transition-all transform-gpu duration-200 ease-in-out"
          :path="activeArticle._path"
        />
      </BlogCard>
    </div>

    <div class="flex flex-row flex-wrap gap-4 justify-center mt-8">
      <p class="max-w-prose text-center"> I write articles on various topics, including web development, design, and technology. </p>
    </div>
  </section>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'ArticlesSection',

    data() {
      return {
        articles: [],

        activeArticleIndex: 0,
        runAnimation: false,
      };
    },

    async mounted() {
      this.articles = await queryContent('blog').find();

      setInterval(() => {
        if (this.pauseArticleInterval) return;

        this.runAnimation = true;

        setTimeout(() => {
          this.runAnimation = false;

          this.activeArticleIndex = this.activeArticleIndex === this.articles.length - 1 ? 0 : this.activeArticleIndex + 1;
        }, 200);
      }, 5000);
    },

    methods: {
      formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      },
    },

    computed: {
      activeArticle() {
        return this.articles[this.activeArticleIndex];
      },
    },
  });
</script>
