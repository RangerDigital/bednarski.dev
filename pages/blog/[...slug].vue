<template>
  <section class="flex flex-col xl:flex-row xl:gap-4 justify-center items-start mt-8">
    <BaseTag class="mt-7 cursor-pointer underline underline-offset-4 decoration-dark-lighter" @click="goBack"
      ><svg class="h-[1.1cap]" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M5.94372 1.21891C6.2356 1.51079 6.2356 1.98402 5.94372 2.2759L3.5518 4.66782H11.8339C15.7916 4.66782 19 7.87619 19 11.8339C19 15.7916 15.7916 19 11.8339 19H1.7474C1.33462 19 1 18.6654 1 18.2526C1 17.8398 1.33462 17.5052 1.7474 17.5052H11.8339C14.9661 17.5052 17.5052 14.9661 17.5052 11.8339C17.5052 8.70175 14.9661 6.16263 11.8339 6.16263H3.5518L5.94372 8.55455C6.2356 8.84643 6.2356 9.31966 5.94372 9.61154C5.65184 9.90342 5.17861 9.90342 4.88673 9.61154L1.21891 5.94372C0.92703 5.65184 0.92703 5.17861 1.21891 4.88673L4.88673 1.21891C5.17861 0.92703 5.65184 0.92703 5.94372 1.21891Z"
          fill="currentColor"
        ></path>
      </svg>
      Go Back</BaseTag
    >

    <div class="max-w-2xl w-full">
      <MarkdownContentRendered />
    </div>

    <BaseTag class="mt-7 invisible">Go Back</BaseTag>
  </section>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'BlogPost',

    methods: {
      goBack() {
        this.$router.go(-1);
      },
    },
  });
</script>
