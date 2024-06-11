<template>
  <section class="flex-col xl:flex-row flex justify-between w-full gap-4 h-full flex-nowrap">
    <div class="flex flex-col gap-6">
      <h1 class="text-5xl xl:text-9xl font-semibold font-headings">Jakub Bednarski<span class="text-primary text-2xl xl:text-6xl">.dev</span></h1>

      <p class="max-w-prose"
        ><span class="text-primary underline underline-offset-4">Full-Stack Design Engineer</span> who loves building and breaking visually pleasing web apps and internet of things
        products. Fan of anime, Tailwind, Nest.js, Fastify.js, Vue.js, DevOps and Open Source software.</p
      >

      <!-- <BaseButton @click="contactMe">Get in Touch with me</BaseButton> -->
    </div>

    <div class="flex flex-row flex-wrap xl:flex-col gap-4">
      <BaseTag>
        <svg width="18" height="17" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M5.76023 1.65814C5.90442 1.6027 6.06212 1.59312 6.21193 1.63069L14.0068 3.58574L17.6583 2.18184C17.6719 2.17659 17.6856 2.17134 17.6992 2.16608C17.9723 2.06101 18.2495 1.95432 18.4864 1.9013C18.7508 1.84211 19.1366 1.8084 19.4986 2.05812C19.8605 2.30785 19.9672 2.68134 20.0068 2.95022C20.0422 3.19109 20.0421 3.489 20.042 3.78237C20.042 3.79706 20.042 3.76772 20.042 3.78237L20.042 14.038C20.042 14.0463 20.042 14.0547 20.042 14.0632C20.042 14.2047 20.0421 14.3649 20.0268 14.5048C20.0087 14.6716 19.9635 14.8771 19.8286 15.0784C19.6936 15.2797 19.521 15.3992 19.3738 15.479C19.2504 15.5459 19.1024 15.6063 18.9718 15.6596L14.3383 17.5524C14.1903 17.6129 14.027 17.6245 13.8721 17.5856L6.07715 15.6306L2.4257 17.0345C2.41206 17.0397 2.39839 17.045 2.38472 17.0502C2.1117 17.1553 1.83445 17.262 1.5976 17.315C1.33319 17.3742 0.947377 17.4079 0.585416 17.1582C0.223455 16.9085 0.116764 16.535 0.077233 16.2661C0.0418216 16.0252 0.041912 15.7273 0.0420011 15.4339C0.0420056 15.4193 0.0420101 15.4046 0.0420101 15.3899V5.0678C0.0420101 5.0593 0.0420067 5.05072 0.0420033 5.04208C0.0419458 4.89754 0.0418808 4.7342 0.0576317 4.59172C0.0763949 4.422 0.123077 4.21269 0.262736 4.00895C0.402395 3.8052 0.58051 3.68656 0.731763 3.60825C0.858733 3.54251 1.01079 3.48412 1.14534 3.43245C1.15339 3.42936 1.16137 3.42629 1.16928 3.42325L5.76023 1.65814ZM6.78181 14.2513L13.3022 15.8866V4.96505L6.78181 3.32966V14.2513ZM5.27711 3.46053V14.3215L1.88724 15.6249C1.7543 15.676 1.64449 15.7181 1.54861 15.753C1.54675 15.6507 1.54671 15.5327 1.54671 15.3899V5.0678C1.54671 4.99838 1.54673 4.94298 1.54736 4.89523C1.59158 4.87756 1.64313 4.85771 1.70775 4.83287L5.27711 3.46053ZM14.8069 4.89478V15.7311L18.3811 14.271C18.4438 14.2454 18.4938 14.2249 18.5367 14.2067C18.5373 14.1601 18.5373 14.1059 18.5373 14.038V3.82639C18.5373 3.68356 18.5372 3.5656 18.5354 3.4633C18.4395 3.49817 18.3297 3.54034 18.1967 3.59145L14.8069 4.89478Z"
            fill="currentColor"
          ></path>
        </svg>

        <p>Rzeszów, Poland <span class="text-xs">(GMT+1)</span> </p>
      </BaseTag>

      <BaseTag>
        <svg width="18" height="17" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.53631 6.9273C4.75393 6.57142 5.22436 6.45603 5.58705 6.66955L5.9644 6.89171C7.12942 7.57759 7.9551 8.06265 8.64697 8.38181C9.32314 8.69372 9.81444 8.819 10.2987 8.819C10.783 8.819 11.2743 8.69373 11.9504 8.38181C12.6423 8.06265 13.468 7.57759 14.633 6.89171L15.0103 6.66955C15.373 6.45603 15.8435 6.57142 16.0611 6.9273C16.2787 7.28318 16.1611 7.74477 15.7984 7.9583L15.3861 8.20104C14.2639 8.86172 13.3723 9.38664 12.6021 9.74193C11.8082 10.1081 11.0872 10.3219 10.2987 10.3219C9.51018 10.3219 8.78917 10.1081 7.9953 9.74193C7.22511 9.38664 6.33352 8.86173 5.21131 8.20104L4.799 7.9583C4.43631 7.74477 4.3187 7.28318 4.53631 6.9273Z"
            fill="currentColor"
          ></path>
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.40592 2H12.1915C13.7009 1.99999 14.8969 1.99998 15.8479 2.10214C16.8231 2.2069 17.6322 2.42646 18.3258 2.92793C18.7178 3.21141 19.0641 3.5512 19.353 3.93588C19.8641 4.61638 20.0878 5.41029 20.1946 6.36722C20.2987 7.30037 20.2987 8.47384 20.2987 9.95493V10.0451C20.2987 11.5262 20.2987 12.6996 20.1946 13.6328C20.0878 14.5897 19.8641 15.3836 19.353 16.0641C19.0641 16.4488 18.7178 16.7886 18.3258 17.0721C17.6322 17.5735 16.8231 17.7931 15.8479 17.8979C14.8969 18 13.7009 18 12.1915 18H8.40594C6.89649 18 5.70055 18 4.74954 17.8979C3.77429 17.7931 2.96518 17.5735 2.27165 17.0721C1.87961 16.7886 1.53331 16.4488 1.24441 16.0641C0.733336 15.3836 0.509572 14.5897 0.402803 13.6328C0.298687 12.6996 0.298696 11.5262 0.298706 10.0451V9.95491C0.298696 8.47383 0.298687 7.30036 0.402803 6.36722C0.509572 5.41029 0.733336 4.61638 1.24441 3.93588C1.53331 3.5512 1.87961 3.21141 2.27165 2.92793C2.96518 2.42646 3.77429 2.2069 4.74954 2.10214C5.70055 1.99998 6.89648 1.99999 8.40592 2ZM4.91623 3.59614C4.07291 3.68673 3.56748 3.85788 3.18032 4.13783C2.91208 4.33179 2.67514 4.56428 2.47747 4.82748C2.19216 5.20737 2.01773 5.7033 1.92541 6.53078C1.83148 7.37259 1.83041 8.46376 1.83041 10C1.83041 11.5362 1.83148 12.6274 1.92541 13.4692C2.01773 14.2967 2.19216 14.7926 2.47747 15.1725C2.67514 15.4357 2.91208 15.6682 3.18032 15.8622C3.56748 16.1421 4.07291 16.3133 4.91623 16.4039C5.77416 16.496 6.88622 16.4971 8.45187 16.4971H12.1455C13.7112 16.4971 14.8232 16.496 15.6812 16.4039C16.5245 16.3133 17.0299 16.1421 17.4171 15.8622C17.6853 15.6682 17.9223 15.4357 18.1199 15.1725C18.4053 14.7926 18.5797 14.2967 18.672 13.4692C18.7659 12.6274 18.767 11.5362 18.767 10C18.767 8.46376 18.7659 7.37259 18.672 6.53078C18.5797 5.7033 18.4053 5.20737 18.1199 4.82748C17.9223 4.56428 17.6853 4.33179 17.4171 4.13783C17.0299 3.85788 16.5245 3.68673 15.6812 3.59614C14.8232 3.50398 13.7112 3.50293 12.1455 3.50293H8.45187C6.88622 3.50293 5.77416 3.50398 4.91623 3.59614Z"
            fill="currentColor"
          ></path>
        </svg>
        <a href="mailto:jakub@bednarski.dev">Jakub@Bednarski.Dev</a>
      </BaseTag>

      <BaseTag>
        <svg width="18" height="17" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10 1C5.07504 1 1 4.9078 1 9.8312C1 11.8148 1.66696 13.6432 2.7855 15.1123C2.9659 15.3493 3.02377 15.5422 3.0146 15.6792C2.96869 16.3648 2.73933 17.0367 2.15953 17.6394C1.95948 17.8473 1.89268 18.1554 1.98506 18.4315C2.0776 18.7081 2.31536 18.908 2.5998 18.9397C4.42103 19.1428 6.02795 18.799 6.98589 18.4095C7.21448 18.3165 7.43307 18.2998 7.6091 18.3473C8.37142 18.5529 9.17331 18.6624 10 18.6624C14.925 18.6624 19 14.7546 19 9.8312C19 4.9078 14.925 1 10 1ZM2.46752 9.8312C2.46752 5.84346 5.7947 2.52801 10 2.52801C14.2053 2.52801 17.5325 5.84346 17.5325 9.8312C17.5325 13.8189 14.2053 17.1344 10 17.1344C9.29812 17.1344 8.61989 17.0415 7.97716 16.8681C7.44373 16.7243 6.90604 16.8015 6.45189 16.9862C5.91921 17.2028 5.07261 17.4197 4.06131 17.4639C4.31547 16.9133 4.44117 16.344 4.47857 15.7855C4.52324 15.1184 4.23423 14.5554 3.93552 14.1631C3.00996 12.9474 2.46752 11.4495 2.46752 9.8312Z"
            fill="currentColor"
          ></path>
          <path d="M7 10C7 10.5523 6.55228 11 6 11C5.44772 11 5 10.5523 5 10C5 9.44771 5.44772 9 6 9C6.55228 9 7 9.44771 7 10Z" fill="currentColor"></path>
          <path d="M11 10C11 10.5523 10.5523 11 10 11C9.44771 11 9 10.5523 9 10C9 9.44771 9.44771 9 10 9C10.5523 9 11 9.44771 11 10Z" fill="currentColor"></path>
          <path d="M15 10C15 10.5523 14.5523 11 14 11C13.4477 11 13 10.5523 13 10C13 9.44771 13.4477 9 14 9C14.5523 9 15 9.44771 15 10Z" fill="currentColor"></path>
        </svg>
        <p>Polish, English</p>
      </BaseTag>

      <BaseTag @click="$router.push('/share')" class="cursor-pointer xl:hidden">
        <svg width="18" height="17" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
          <path
            d="M8.5 4H6C4.89543 4 4 4.89543 4 6V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V6C20 4.89543 19.1046 4 18 4H15.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          ></path>
          <path
            d="M8 6.4V4.5C8 4.22386 8.22386 4 8.5 4C8.77614 4 9.00422 3.77604 9.05152 3.50398C9.19968 2.65171 9.77399 1 12 1C14.226 1 14.8003 2.65171 14.9485 3.50398C14.9958 3.77604 15.2239 4 15.5 4C15.7761 4 16 4.22386 16 4.5V6.4C16 6.73137 15.7314 7 15.4 7H8.6C8.26863 7 8 6.73137 8 6.4Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          ></path>
        </svg>
        <p>Share</p>
      </BaseTag>
    </div>
  </section>

  <section class="my-12 flex flex-col flex-nowrap">
    <BaseHeader subtitle="Tools Section">Tools & Software</BaseHeader>

    <div class="flex flex-row flex-wrap gap-2 xl:gap-4 justify-center mt-6">
      <BaseTag> Vue.js</BaseTag>
      <BaseTag> Nuxt.js</BaseTag>
      <BaseTag> Tailwind CSS</BaseTag>
      <BaseTag> TypeScript</BaseTag>
      <BaseTag> Nest.js</BaseTag>
      <BaseTag> Fastify.js</BaseTag>
      <BaseTag> Docker</BaseTag>
      <BaseTag> GitHub</BaseTag>
      <BaseTag> GitHub Actions</BaseTag>

      <BaseTag> GitHub Copilot</BaseTag>
      <BaseTag> VSCode</BaseTag>
      <BaseTag> Figma</BaseTag>
    </div>

    <div class="flex flex-row flex-wrap gap-4 justify-center mt-6">
      <p class="max-w-prose text-center"> I continually explore and adopt new tools and software to enhance my project development and workflow efficiency.</p>
    </div>
  </section>

  <section class="my-12 flex flex-col flex-nowrap items-center">
    <BaseHeader subtitle="Content Section">Articles</BaseHeader>

    <div class="flex flex-col xl:flex-row gap-8 xl:gap-28 justify-center mt-8 flex-nowrap w-full" v-if="activeArticle">
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

  <section class="flex-row items-center justify-center flex bg-stripes bg-stripe py-8 rounded-sm border border-dark-lighter">
    <div class="flex flex-col gap-4 items-center">
      <BaseTag>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.8727 7.89087C8.49783 9.01706 7.92549 10.3029 7.06113 11.1354C6.38815 11.7837 5.43926 12.2522 4.58734 12.5797C5.43926 12.9072 6.38815 13.3756 7.06113 14.0239C7.92549 14.8565 8.49783 16.1423 8.8727 17.2685C9.24756 16.1423 9.8199 14.8565 10.6843 14.0239C11.3572 13.3756 12.3061 12.9072 13.158 12.5797C12.3061 12.2522 11.3572 11.7837 10.6843 11.1354C9.8199 10.3029 9.24756 9.01706 8.8727 7.89087ZM8.32139 5.37115C8.41905 5.28553 8.60705 5.15933 8.8727 5.15933C9.13834 5.15933 9.32634 5.28553 9.424 5.37115C9.52133 5.45648 9.58676 5.55058 9.6268 5.61473C9.7079 5.74462 9.77518 5.90073 9.83192 6.0458C9.94682 6.33957 10.0851 6.76567 10.2547 7.28843L10.2637 7.31597C10.6223 8.42119 11.1122 9.46422 11.726 10.0555C12.2537 10.5639 13.1272 10.9833 14.0116 11.2956L14.0427 11.3066C14.4273 11.4424 14.7571 11.5588 14.9885 11.6604C15.1036 11.7109 15.2435 11.7784 15.3645 11.868C15.4512 11.9322 15.7454 12.1635 15.7454 12.5797C15.7454 12.9958 15.4512 13.2271 15.3645 13.2913C15.2435 13.3809 15.1036 13.4484 14.9885 13.4989C14.7571 13.6006 14.4273 13.717 14.0427 13.8528L14.0116 13.8638C13.1272 14.176 12.2537 14.5955 11.726 15.1039C11.1122 15.6951 10.6223 16.7381 10.2637 17.8434L10.2547 17.8709C10.0851 18.3937 9.94682 18.8198 9.83192 19.1135C9.77518 19.2586 9.7079 19.4147 9.6268 19.5446C9.58676 19.6088 9.52133 19.7029 9.424 19.7882C9.32634 19.8738 9.13834 20 8.8727 20C8.60705 20 8.41905 19.8738 8.32139 19.7882C8.22406 19.7029 8.15864 19.6088 8.11859 19.5446C8.0375 19.4147 7.97021 19.2586 7.91347 19.1135C7.79856 18.8197 7.66027 18.3936 7.49062 17.8708L7.48172 17.8434C7.12305 16.7381 6.63323 15.6951 6.01941 15.1039C5.49164 14.5955 4.61819 14.176 3.73378 13.8638L3.7027 13.8528C3.3181 13.717 2.98835 13.6006 2.75691 13.4989C2.6418 13.4484 2.50188 13.3809 2.38089 13.2913C2.29417 13.2271 2 12.9958 2 12.5797C2 12.1635 2.29417 11.9322 2.38089 11.868C2.50188 11.7784 2.6418 11.7109 2.75691 11.6604C2.98835 11.5588 3.3181 11.4423 3.7027 11.3066L3.73378 11.2956C4.61819 10.9833 5.49164 10.5639 6.01941 10.0555C6.63323 9.46422 7.12305 8.42119 7.48172 7.31597L7.49063 7.28849C7.66028 6.7657 7.79856 6.33958 7.91347 6.0458C7.97021 5.90073 8.0375 5.74462 8.11859 5.61473C8.15864 5.55058 8.22406 5.45648 8.32139 5.37115Z"
            fill="currentColor"
          ></path>
          <path
            d="M16.8203 7.45872C16.9525 7.57708 17.1228 7.67924 17.3057 7.76625C17.7686 7.98642 18 8.0965 18 8.17029C18 8.24408 17.7686 8.35416 17.3057 8.57432C17.1228 8.66133 16.9525 8.76349 16.8203 8.88186C16.6544 9.03043 16.5158 9.23368 16.4012 9.45605C16.1288 9.98429 15.9927 10.2484 15.9204 10.2484C15.8482 10.2484 15.712 9.98429 15.4397 9.45605C15.325 9.23368 15.1865 9.03043 15.0205 8.88186C14.8883 8.76349 14.7181 8.66133 14.5351 8.57432C14.0723 8.35416 13.8408 8.24408 13.8408 8.17029C13.8408 8.0965 14.0723 7.98642 14.5351 7.76625C14.7181 7.67925 14.8883 7.57708 15.0205 7.45872C15.1865 7.31014 15.325 7.1069 15.4397 6.88452C15.712 6.35628 15.8482 6.09216 15.9204 6.09216C15.9927 6.09216 16.1288 6.35628 16.4012 6.88452C16.5158 7.1069 16.6544 7.31014 16.8203 7.45872Z"
            fill="currentColor"
          ></path>
          <path
            d="M14.094 2.10725C14.3652 2.35267 14.7602 2.54473 15.1479 2.6889C15.6293 2.8679 15.87 2.9574 15.87 3.03606C15.87 3.11472 15.6293 3.20422 15.1479 3.38323C14.7602 3.5274 14.3652 3.71945 14.094 3.96487C13.7599 4.26737 13.5117 4.74349 13.3326 5.21715C13.1178 5.78477 13.0105 6.06859 12.9322 6.06859C12.8539 6.06859 12.7466 5.78477 12.5319 5.21715C12.3527 4.74349 12.1046 4.26737 11.7704 3.96487C11.4993 3.71945 11.1042 3.5274 10.7165 3.38323C10.2351 3.20422 9.99439 3.11472 9.99439 3.03606C9.99439 2.9574 10.2351 2.8679 10.7165 2.6889C11.1042 2.54473 11.4993 2.35267 11.7704 2.10725C12.1046 1.80475 12.3527 1.32864 12.5319 0.854979C12.7466 0.287353 12.8539 0.00354004 12.9322 0.00354004C13.0105 0.00354004 13.1178 0.287356 13.3326 0.85498C13.5117 1.32864 13.7599 1.80475 14.094 2.10725Z"
            fill="currentColor"
          ></path>
        </svg>

        <h3 class="text-base">Coming soon...</h3>
      </BaseTag>
      <p class="max-w-lg text-center"
        >In the meantime, check out last year's
        <a
          class="underline-offset-8 underline decoration-primary hover:no-underline hover:text-primary transition-all duration-150 ease-in-out"
          href="https://archive.bednarski.dev"
          >archive.bednarski.dev</a
        >
        site.</p
      >
    </div>
  </section>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'Home',
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
