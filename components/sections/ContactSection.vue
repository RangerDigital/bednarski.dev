<template>
  <section class="my-12 flex flex-col flex-nowrap items-center w-full" id="contact-form">
    <BaseHeader subtitle="Having a great idea to share?">Send Me a Message</BaseHeader>

    <form @submit.prevent="submitForm()" class="flex flex-col gap-2 xl:gap-4 justify-center mt-6 items-center w-full" v-if="!showSuccess">
      <BaseInput v-model="form.name" label="Your Name" placeholder="eg. John Doe" class="max-w-lg" :error="formErrors.name" autocomplete="name" />

      <BaseInput v-model="form.email" label="Your E-Mail" placeholder="eg. jakub@example.com" type="email" autocomplete="email" class="max-w-lg" :error="formErrors.email" />

      <BaseTextArea v-model="form.message" label="Message" placeholder="Type your message here..." class="max-w-lg mt-4" :error="formErrors.message" counter max-length="1000" />

      <BaseButton :disabled="isPending" type="submit" class="w-full mt-8 mb-4" @click="submitForm()"> Send Message </BaseButton>
    </form>

    <div class="flex flex-col gap-4 justify-center mt-6 items-center w-full" v-if="showSuccess">
      <BaseCard title="Message Sent">
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M14.1811 3.15455C14.5109 3.40513 14.5751 3.87564 14.3245 4.20546L8.51904 11.8469C8.38507 12.0232 8.18001 12.1314 7.95883 12.1423C7.73764 12.1532 7.52294 12.0658 7.37225 11.9035L4.14696 8.43015C3.86511 8.12661 3.88269 7.65207 4.18622 7.37021C4.48975 7.08836 4.9643 7.10594 5.24615 7.40947L7.86436 10.2291L13.1302 3.29804C13.3807 2.96821 13.8512 2.90397 14.1811 3.15455Z"
              fill="currentColor"
            ></path>
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M16.7101 5.50354C17.0381 5.75654 17.0989 6.22751 16.8459 6.55548L9.52311 16.048C9.51531 16.0581 9.50748 16.0682 9.49963 16.0784C9.35427 16.267 9.20089 16.466 9.0502 16.613C8.8763 16.7826 8.61266 16.9782 8.23737 16.9968C7.86207 17.0153 7.5804 16.8467 7.3906 16.6951C7.22612 16.5637 7.05384 16.3808 6.89057 16.2076C6.88175 16.1982 6.87297 16.1889 6.86421 16.1796L3.20217 12.2956C2.91802 11.9942 2.93198 11.5196 3.23336 11.2354C3.53473 10.9512 4.0094 10.9652 4.29356 11.2666L7.95559 15.1506C8.03473 15.2345 8.09941 15.303 8.15642 15.3615C8.20738 15.2977 8.26497 15.2231 8.33543 15.1318L15.6582 5.63927C15.9112 5.31131 16.3822 5.25054 16.7101 5.50354Z"
              fill="currentColor"
            ></path>
          </svg>
        </template>

        <p class="text-center">Your message has been sent successfully. I'll get back to you as soon as possible!</p>
      </BaseCard>
    </div>

    <div class="flex flex-row flex-wrap gap-4 justify-center mt-6">
      <p class="max-w-prose text-center"
        >I'm always open to new opportunities, collaborations, and projects. Feel free to reach out to me for any inquiries or just to say hello!</p
      >
    </div>
  </section>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'ContactSection',

    data() {
      return {
        form: {
          name: '',
          email: '',
          message: '',
        },

        isPending: false,
        showErrors: false,
        showSuccess: false,
      };
    },

    computed: {
      formErrors() {
        if (!this.showErrors) {
          return {};
        }

        const errors = {};

        if (!this.form.name) {
          errors.name = 'I need to know your name to address you properly.';
        }

        if (!this.form.email) {
          errors.email = 'Contacting you back without an email is impossible.';
        }

        if (!this.form.message) {
          errors.message = 'You forgot to write a message. Happens to the best of us.';
        }

        return errors;
      },
    },

    methods: {
      async submitForm() {
        if (this.isPending) {
          return;
        }

        this.isPending = true;
        this.showErrors = true;

        if (Object.keys(this.formErrors).length > 0) {
          this.isPending = false;
          return;
        }

        const response = await fetch('https://discord.com/api/webhooks/1254488723865997432/N0tqSOvoN2_K_OECT-ueN55NsSvM7z4ssVeG3n_5UvYrmKeG5YoClIyk5Twi0jP0aVQG', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            embeds: [
              {
                title: this.form.name,
                description: this.form.message,

                fields: [
                  {
                    name: 'Email',
                    value: this.form.email,
                  },
                  {
                    name: 'User Agent',
                    value: navigator.userAgent,
                  },
                  {
                    name: 'Language',
                    value: navigator.language,
                  },
                  {
                    name: 'Date',
                    value: new Date().toISOString(),
                  },
                ],
              },
            ],
          }),
        });

        if (response.ok) {
          this.showSuccess = true;
          this.showErrors = false;

          this.form = {
            name: '',
            email: '',
            message: '',
          };
        }

        this.isPending = false;
      },
    },
  });
</script>
