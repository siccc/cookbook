<script setup lang="ts">
import { RouterView } from 'vue-router';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { setLocale } from '@/i18n';
import { getUser } from '@/stores/user';
import Menu from '@/components/Menu.vue';
import ErrorState from '@/components/ErrorState.vue';

const router = useRouter();
const { t } = useI18n();
const { isError, error, data, isLoading } = getUser();
const errorMessage = ref('');

watch(
  data, (newData, oldData) => {
    if (newData !== oldData && newData) {
      setLocale(newData.settings.lang);
    }
  },
  { once: true }
)
const showMenu = computed(() => {
  return router.currentRoute.value.path !== '/login';
});

watch(error, (newValue) => {
  if (newValue instanceof Error) {
    if (newValue.message.includes('401')) {
      location.href = '/login';
    } else if (newValue.message.includes('503')) {
      errorMessage.value = t('errors.appOffline');
    } else {
      errorMessage.value = newValue.message;
    }
  }
});

</script>

<template>
  <Menu v-if="showMenu && !isLoading" />
  <RouterView v-if="!isError && !isLoading" />
  <div v-if="isError && errorMessage" class="p-3 md:p-9 max-w-screen-sm mx-auto mt-14">
    <ErrorState :error="errorMessage" />
  </div>
</template>
