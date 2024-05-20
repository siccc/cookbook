<script setup lang="ts">
import { ref } from 'vue';
import { getUser } from '@/stores/user';
import Button from '@/components/Button.vue';
import SelectInput from '@/components/SelectInput.vue';

// const { isLoading, isError: fetchingIsError, data, error: fetchingError } = getUser();
// console.log(data.value);
const selectedLanguage = ref('');
const selectedLocation = ref('');
const languages = ref(['English', 'Hungarian']);
const locations = ref(['The Netherlands', 'Hungary']);


function onSelectedLanguageChange(event: Event) {
  selectedLanguage.value = (event.target as HTMLInputElement).value;
  // setUserLanguage(selectedLanguage.value);
}

function onSelectedLocationChange(event: Event) {
  selectedLocation.value = (event.target as HTMLInputElement).value;
  // setUserLanguage(selectedLocation.value);
}
</script>

<template>
  <main class="px-6 md:px-9 max-w-screen-sm mx-auto mt-14 mb-20">
    <div class="pt-6">
      <h1 class="mb-6 text-2xl text-center md:text-left">
        Settings
      </h1>
      <div class="flex items-stretch sm:items-center flex-col sm:flex-row gap-1 sm:gap-3">
        <div class="mr-3 w-40">Language</div>
        <SelectInput
          class="flex-1"
          :value="selectedLanguage"
          :options="languages"
          @change="onSelectedLanguageChange"
        />
      </div>
      <div class="mt-6 flex items-stretch sm:items-center flex-col sm:flex-row gap-1 sm:gap-3">
        <div class="mr-3 w-40">Seasonal food location</div>
        <SelectInput
          class="flex-1"
          :value="selectedLocation"
          :options="locations"
          @change="onSelectedLocationChange"
        />
      </div>
    </div>
  </main>
</template>