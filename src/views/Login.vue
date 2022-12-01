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
  }
}

function onCaptchaExpired () {
  if (recaptcha.value) {
    (recaptcha.value as VueRecaptcha).reset();
  }
}

function onSubmit() {
  router.push('/');
}
</script>

<template>
  <div class="bg-sky-50 lg:bg-white absolute inset-0 flex">
    <div class="flex-1 flex flex-col items-center justify-center rounded-xl p-3 m-3 bg-white">
      <DetailedLogo class="w-32 h-32 mt-3" />
      <div class="text-2xl text-center my-6 font-k2d">Hey, welcome to Cookbook</div>
      <div class="sm:w-96 text-center mb-9">Cookbook is my demo project, a recipe organiser app,
        where I can access all my favorite recipes. Whether I'm using my phone in the kitchen or I checking out the recipes on my laptop.
      </div>
      <vue-recaptcha
        ref="recaptcha"
        sitekey="6Le0wBcjAAAAAPnP-HHegwxHBJgtcqvZDDQAMZT3"
        @verify="onCaptchaVerified"
        @expired="onCaptchaExpired"
      />
      <Button
        class="my-6 uppercase" 
        primary 
        @click="onSubmit"
        :disabled="!createUserMutation.data.value"
      >
        <SpinnerIcon v-if="createUserMutation.isLoading.value" class="w-8 h-8 animate-spin mr-2"/>
        Check it out
      </Button>
      <div
        class="text-xl text-red-300"
        v-if="createUserMutation.isError.value"
      >
        {{ createUserMutation.error.value }}
      </div>
    </div>
    <img class="object-cover object-right rounded-xl w-1/3 m-4 hidden lg:block" src="@/assets/pexels-ella-olsson-1640774.jpg"/>
  </div>
</template>