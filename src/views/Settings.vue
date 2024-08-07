<script setup lang="ts">
import { ref, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getUser, useUpdateUserMutation } from '@/stores/user';
import { setLocale } from "@/i18n";
import Button from '@/components/Button.vue';
import SelectInput from '@/components/SelectInput.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingState from '@/components/LoadingState.vue';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import type { Language, Location } from '@/types';

const { tm } = useI18n();
const selectedLanguage:Ref<Language> = ref('en');
const selectedLocation:Ref<Location> = ref('hu');
const { isLoading, isError, data, error } = getUser();
const updateUserMutation = useUpdateUserMutation();

// copy user data
watch(
  data, (data) => {
    if (data) {
      selectedLanguage.value = data.settings.lang;
      selectedLocation.value = data.settings.location;
    }
  },
  { immediate:true }
)

const saveInProgress = ref(false);
const savingIsError = ref(false);
const savingErrorMessage = ref('');

// -----------------------------------
// METHODS
// -----------------------------------

function selectedLanguageChange(event: Event) {
  selectedLanguage.value = (event.target as HTMLInputElement).value as Language;
}

function selectedLocationChange(event: Event) {
  selectedLocation.value = (event.target as HTMLInputElement).value as Location;
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
    setLocale(selectedLanguage.value);
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
        {{ $t("menu.settings") }}
      </h1>
      <div v-if="!isLoading" class="flex flex-col gap-6">
        <div class="flex items-stretch sm:items-center flex-col sm:flex-row gap-1 sm:gap-3">
          <label class="mr-3 w-40" for="id">{{ $t("settings.accountId") }}</label>
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
          <div class="mr-3 w-40">{{ $t("settings.language") }}</div>
          <SelectInput
            class="flex-1"
            :value="selectedLanguage"
            :options="tm('settings.languages')"
            i18n-options
            @change="selectedLanguageChange"
          />
        </div>
        <div class="flex items-stretch sm:items-center flex-col sm:flex-row gap-1 sm:gap-3">
          <div class="mr-3 w-40">{{ $t("settings.location") }}</div>
          <SelectInput
            class="flex-1"
            :value="selectedLocation"
            :options="tm('settings.locations')"
            i18n-options
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
          {{ $t("saveChanges") }}
        </Button>
      </div>
    </div>
    <LoadingState v-if="isLoading" />
    <ErrorState v-else-if="isError" :error="error" />
  </main>
</template>