<script setup lang="ts">
import { ref, watch } from 'vue';
import { getUser, useUpdateUserMutation } from '@/stores/user';
import Button from '@/components/Button.vue';
import SelectInput from '@/components/SelectInput.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingState from '@/components/LoadingState.vue';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';

const selectedLanguage = ref('');
const selectedLocation = ref('');
const { isLoading, isError, data, error } = getUser();
const updateUserMutation = useUpdateUserMutation();

// copy user data
watch(
  data, (data) => {
    if (data) {
      selectedLanguage.value = data.settings.lang || '';
      selectedLocation.value = data.settings.location || '';
    }
  },
  { immediate:true }
)

const languages = [
  { value: 'hu', label: 'Magyar' },
  { value: 'en', label: 'English' },
];
const locations = [
  { value: 'hu', label: 'Magyarország' },
  { value: 'nl', label: 'The Netherlands' },
];
const saveInProgress = ref(false);
const savingIsError = ref(false);
const savingErrorMessage = ref('');

// -----------------------------------
// METHODS
// -----------------------------------

function selectedLanguageChange(event: Event) {
  selectedLanguage.value = (event.target as HTMLInputElement).value;
}

function selectedLocationChange(event: Event) {
  selectedLocation.value = (event.target as HTMLInputElement).value;
}

async function onSaveClick() {
  if (!data.value) {
    return;
  }
  saveInProgress.value = true;
  try {
    await updateUserMutation.mutateAsync({
      ...data.value,
      settings: {
        lang: selectedLanguage.value,
        location: selectedLocation.value
      }
    });
    saveInProgress.value = false;
  } catch (error) {
    saveInProgress.value = false;
    savingIsError.value = true;
    savingErrorMessage.value = error as string;
  }
}

</script>

<template>
  <main class="px-6 md:px-9 max-w-screen-sm mx-auto mt-14 mb-20">
    <div class="pt-6">
      <h1 class="mb-6 text-2xl">
        Settings
      </h1>
      <div v-if="!isLoading" class="flex flex-col gap-6">
        <div class="flex items-stretch sm:items-center flex-col sm:flex-row gap-1 sm:gap-3">
          <label class="mr-3 w-40" for="id">Account ID</label>
          <input
            type="text"
            name="id"
            id="id"
            class="flex-1 cursor-default"
            :value="data?.userId"
            readonly
          />
        </div>
        <div class="flex items-stretch sm:items-center flex-col sm:flex-row gap-1 sm:gap-3">
          <div class="mr-3 w-40">Language</div>
          <SelectInput
            class="flex-1"
            :value="selectedLanguage"
            :options="languages"
            @change="selectedLanguageChange"
          />
        </div>
        <div class="flex items-stretch sm:items-center flex-col sm:flex-row gap-1 sm:gap-3">
          <div class="mr-3 w-40">Location</div>
          <SelectInput
            class="flex-1"
            :value="selectedLocation"
            :options="locations"
            @change="selectedLocationChange"
          />
        </div>
        <Button
          type="primary"
          class="mt-6"
          :disabled="saveInProgress"
          @click="onSaveClick()"
        >
          <SpinnerIcon v-if="saveInProgress" class="w-6 h-6 animate-spin mr-1"/>
          Save changes
        </Button>
      </div>
    </div>
    <LoadingState v-if="isLoading" />
    <ErrorState v-else-if="isError" :error="error" />
  </main>
</template>