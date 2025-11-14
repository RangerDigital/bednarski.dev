<template>
  <section class="flex flex-col gap-4 items-center justify-center pt-6 xl:pt-16">
    <pre v-if="!isLoading && status?.locked" class="animate-flicker scale-50 xl:scale-100 text-xs">
                       uuuuuuuuuuuuuuuuuuuuu.
                   .u$$$$$$$$$$$$$$$$$$$$$$$$$$W.
                 u$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$Wu.
               $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$i
              $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
         `    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
           .i$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$i
           $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$W
          .$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$W
         .$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$i
         #$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$.
         W$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$u       #$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$~
$#      `"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$i        $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$$        #$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$$         $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
#$.        $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$#
 $$      $iW$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$!
 $$i      $$$$$$$#"" `"""#$$$$$$$$$$$$$$$$$#""""""#$$$$$$$$$$$$$$$W
 #$$W    `$$$#"            "       !$$$$$`           `"#$$$$$$$$$$#
  $$$     ``                 ! !iuW$$$$$                 #$$$$$$$#
  #$$    $u                  $   $$$$$$$                  $$$$$$$~
   "#    #$$i.               #   $$$$$$$.                 `$$$$$$
          $$$$$i.                """#$$$$i.               .$$$$#
          $$$$$$$$!         .   `    $$$$$$$$$i           $$$$$
          `$$$$$  $iWW   .uW`        #$$$$$$$$$W.       .$$$$$$#
            "#$$$$$$$$$$$$#`          $$$$$$$$$$$iWiuuuW$$$$$$$$W
               !#""    ""             `$$$$$$$##$$$$$$$$$$$$$$$$
          i$$$$    .                   !$$$$$$ .$$$$$$$$$$$$$$$#
         $$$$$$$$$$`                    $$$$$$$$$Wi$$$$$$#"#$$`
         #$$$$$$$$$W.                   $$$$$$$$$$$#   ``
          `$$$$##$$$$!       i$u.  $. .i$$$$$$$$$#""
             "     `#W       $$$$$$$$$$$$$$$$$$$`      u$#
                            W$$$$$$$$$$$$$$$$$$      $$$$W
                            $$`!$$$##$$$$``$$$$      $$$$!
                           i$" $$$$  $$#"`  """     W$$$$
                                                   W$$$$!
                      uW$$  uu  uu.  $$$  $$$Wu#   $$$$$$
                     ~$$$$iu$$iu$$$uW$$! $$$$$$i .W$$$$$$
             ..  !   "#$$$$$$$$$$##$$$$$$$$$$$$$$$$$$$$#"
             $$W  $     "#$$$$$$$iW$$$$$$$$$$$$$$$$$$$$$W
             $#`   `       ""#$$$$$$$$$$$$$$$$$$$$$$$$$$$
                              !$$$$$$$$$$$$$$$$$$$$$#`
                              $$$$$$$$$$$$$$$$$$$$$$!
                            $$$$$$$$$$$$$$$$$$$$$$$`
                             $$$$$$$$$$$$$$$$$$$$"
    </pre>

    <BaseCard v-else-if="!isLoading" title="Warning | This action is irreversible!" class="!max-w-lg w-full">
      <p class="text-sm leading-relaxed"
        >Please be cautious when entering your information.<br />Current status: <span class="font-semibold">{{ status.locked ? 'Dead' : 'Alive' }}</span></p
      >
      <form @submit.prevent="sendRequest()" class="flex flex-col gap-2 xl:gap-4 justify-center mt-6 items-center w-full">
        <BaseInput v-model="form.user" label="User" placeholder="eg. John Doe" class="max-w-lg" :error="formErrors.user" />

        <BaseInput v-model="form.code" label="TOTP Code" placeholder="eg. 12345" type="text" autocomplete="off" class="max-w-lg" :error="formErrors.code" />

        <button
          :disabled="isPending"
          type="submit"
          class="mt-4 mb-4 px-10 py-3 text-sm font-medium shadow-inner-white font-headings border-dark-lighter text-white bg-dark-light rounded-md w-full xl:w-min border outline-none leading-tight whitespace-nowrap transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          @click="sendRequest()"
        >
          Activate Deathhand
        </button>
      </form>
    </BaseCard>

    <p v-else class="text-lg animate-pulse"> ... </p>
  </section>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'Deathhand',
    data() {
      return {
        status: null,

        form: {
          user: '',
          code: '',
        },
        isLoading: true,
        isPending: false,
        showError: false,
        isError: false,
      };
    },

    mounted() {
      this.fetchStatus();
    },

    computed: {
      formErrors() {
        const errors = {};
        if (!this.showError) {
          return errors;
        }

        if (!this.form.user) {
          errors.user = 'Please provide your user name.';
        }
        if (!this.form.code) {
          errors.code = 'Please provide your SDC code.';
        }
        return errors;
      },
    },

    methods: {
      async fetchStatus() {
        try {
          const response = await fetch('https://deathhand.bednarski.dev/api/status');
          this.status = await response.json();
        } catch (error) {
          console.error('Error fetching status:', error);
        } finally {
          this.isLoading = false;
        }
      },

      async sendRequest() {
        if (this.isPending) {
          return;
        }

        if (Object.keys(this.formErrors).length > 0) {
          return;
        }

        this.showError = true;
        this.isPending = true;

        await fetch('https://deathhand.bednarski.dev/api/lock-totp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: this.form.user,
            code: this.form.code,
          }),
        })
          .then((response) => response.json())
          .then(() => {
            this.isPending = false;
            this.isError = false;
          })
          .catch(() => {
            this.isPending = false;
            this.isError = true;
          })
          .finally(() => {
            this.fetchStatus();
          });
      },
    },
  });
</script>
