<script setup lang="ts">
import { useCreateUserMutation } from '@/stores/user';
import { VueRecaptcha } from 'vue-recaptcha';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { CallbackTypes } from "vue3-google-login";
import { googleAuthCodeLogin } from "vue3-google-login";
import Button from '@/components/Button.vue';
import DetailedLogo from '@/assets/detailed-logo.svg?component';
import GoogleIcon from '@/assets/icons/google-logo.svg?component';
import UserIcon from '@/assets/icons/user-circle.svg?component';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';

const router = useRouter();
const recaptcha = ref(null);

const createUserMutation = useCreateUserMutation();

async function onCaptchaVerified (recaptchaToken: string) {
  if (recaptcha.value) {
    (recaptcha.value as VueRecaptcha).reset();
    await createUserMutation.mutateAsync({type: 'demo', recaptchaToken});
    router.push('/');
  }
}

function onCaptchaExpired () {
  if (recaptcha.value) {
    (recaptcha.value as VueRecaptcha).reset();
  }
}

function onStartDemoClick() {
  if (recaptcha.value) {
    (recaptcha.value as VueRecaptcha).execute();
  }
}

async function onGoogleSignUp() {
  const googleCode = await googleAuthCodeLogin();
  await createUserMutation.mutateAsync({type: 'google', googleCode});
  router.push('/');
}


</script>

<template>
  <main class="bg-sky-50 lg:bg-white absolute inset-0 flex">
    <div class="flex-1 flex flex-col items-center justify-center rounded-xl p-3 m-4 sm:m-10
    bg-white"
    >
      <DetailedLogo class="w-32 h-32 mt-3 shrink-0" />
      <div class="text-2xl text-center my-6 font-k2d">
        Hey, welcome to Cookbook<sup class="text-sm">DEMO</sup>
      </div>
      <div class="sm:w-96 text-center mb-9">Bring your treasured family recipes into the digital
        age with my easy-to-use recipe app. Keep all of your favorite dishes in one convenient
        place and share them with loved ones near and far.
      </div>
      
      <div v-if="createUserMutation.isLoading.value" class="flex justify-center items-center">
        <SpinnerIcon class="w-8 h-8 animate-spin mr-2"/>
        <span>Logging in...</span>
      </div>
      <div v-else>
        <button class="border-2 border-yellow-400 p-3 rounded-lg sm:w-96 flex items-center
          select-none hover:bg-amber-100 w-full"
          @click="onGoogleSignUp"
        >
          <GoogleIcon class="w-5 h-5 mr-3"/>
          <div class="text-left">
            <div class="font-medium text-amber-500 ßtext-amber-800/50 font-k2d">Login with Google</div>
            <div class="text-stone-400 text-sm">I've already requested access from you</div>
          </div>
        </button>
        <button class="mt-6 border-2 border-stone-200 p-3 rounded-lg sm:w-96 flex items-center
          select-none hover:bg-stone-100 w-full"
          @click="onStartDemoClick"
        >
          <UserIcon class="w-6 h-6 mr-3 text-stone-600"/>
          <div class="text-left">
            <div class="font-medium text-stone-600 font-k2d">Create demo user</div>
            <div class="text-stone-400 text-sm">I just want to try it out real quick</div>
          </div>
        </button>
      </div>
      <!-- Error -->
      <div v-if="createUserMutation.isError.value" class="text-xl text-red-300 text-center mt-3 mb-6">
        {{ createUserMutation.error.value }}
      </div>
    </div>
    <vue-recaptcha
      ref="recaptcha"
      sitekey="6LcCol0jAAAAAKhH5PzaxhZTo5rUhieg6Bpkqr4y"
      size="invisible"
      @verify="onCaptchaVerified"
      @expired="onCaptchaExpired"
    >
    </vue-recaptcha>
    <img
      class="object-cover object-right rounded-xl w-1/3 m-4 hidden lg:block"
      src="@/assets/pexels-ella-olsson-1640774.jpg"
      alt=""
    />
  </main>
</template>
