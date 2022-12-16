<script setup lang="ts">
import Button from '@/components/Button.vue';
import DetailedLogo from '@/assets/detailed-logo.svg?component';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import { useCreateUserMutation } from '@/stores/user';
import { VueRecaptcha } from 'vue-recaptcha';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const recaptcha = ref(null);

const createUserMutation = useCreateUserMutation();

async function onCaptchaVerified (recaptchaToken: string) {
  if (recaptcha.value) {
    (recaptcha.value as VueRecaptcha).reset();
    await createUserMutation.mutateAsync(recaptchaToken);
    router.push('/');
  }
}

function onCaptchaExpired () {
  if (recaptcha.value) {
    (recaptcha.value as VueRecaptcha).reset();
  }
}

function onSubmit() {
  if (recaptcha.value) {
    (recaptcha.value as VueRecaptcha).execute();
  }
}
</script>

<template>
  <div class="bg-sky-50 lg:bg-white absolute inset-0 flex">
    <div class="flex-1 flex flex-col items-center justify-center rounded-xl p-3 m-4 sm:m-10
    bg-white"
    >
      <DetailedLogo class="w-32 h-32 mt-3" />
      <div class="text-2xl text-center my-6 font-k2d">
        Hey, welcome to Cookbook<sup class="text-sm">DEMO</sup>
      </div>
      <div class="sm:w-96 text-center mb-9">Bring your treasured family recipes into the digital
        age with my easy-to-use recipe app. Keep all of your favorite dishes in one convenient
        place and share them with loved ones near and far.
      </div>
      <vue-recaptcha
        ref="recaptcha"
        sitekey="6LcCol0jAAAAAKhH5PzaxhZTo5rUhieg6Bpkqr4y"
        size="invisible"
        @verify="onCaptchaVerified"
        @expired="onCaptchaExpired"
      >
      </vue-recaptcha>
      <Button
        class="my-6" 
        primary 
        @click="onSubmit"
        :disabled="createUserMutation.isLoading.value"
      >
        <SpinnerIcon v-if="createUserMutation.isLoading.value" class="w-8 h-8 animate-spin mr-2"/>
        <span v-if="createUserMutation.isLoading.value">Creating demo user...</span>
        <span v-else class="uppercase">Start demo</span>
      </Button>
      <div
        class="text-xl text-red-300"
        v-if="createUserMutation.isError.value"
      >
        {{ createUserMutation.error.value }}
      </div>
    </div>
    <img
      class="object-cover object-right rounded-xl w-1/3 m-4 hidden lg:block"
      src="@/assets/pexels-ella-olsson-1640774.jpg"
    />
  </div>
</template>