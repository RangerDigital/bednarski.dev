<template>
  <section class="my-12 flex flex-col flex-nowrap items-center w-full">
    <BaseHeader subtitle="Having a great idea to share?">Send Me a Message</BaseHeader>

    <form @submit.prevent="submitForm()" class="flex flex-col gap-2 xl:gap-4 justify-center mt-6 items-center w-full" v-if="!showSuccess">
      <BaseInput v-model="form.name" label="Your Name" placeholder="eg. John Doe" class="max-w-lg" :error="formErrors.name" />

      <BaseInput v-model="form.email" label="Your E-Mail" placeholder="eg. jakub@example.com" class="max-w-lg" :error="formErrors.email" />

      <BaseTextArea v-model="form.message" label="Message" placeholder="Type your message here..." class="max-w-lg mt-4" :error="formErrors.message" />

      <BaseButton :disabled="isPending" type="submit" class="w-full" @click="submitForm()"> Send Message </BaseButton>
    </form>

    <div class="flex flex-col gap-4 justify-center mt-6 items-center w-full" v-if="showSuccess">
      <BaseCard title="Message Sent">
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
        }

        this.isPending = false;
        this.showErrors = false;

        this.form = {
          name: '',
          email: '',
          message: '',
        };
      },
    },
  });
</script>
