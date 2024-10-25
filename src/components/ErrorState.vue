<script setup lang="ts">
  import ErrorIcon from '@/assets/error.svg?component';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { t, te } = useI18n();
  const props = defineProps<{
    error: any;
  }>();
  const message = computed(() => {
    let msg = '';
    if (props.error instanceof Error) {
      msg = props.error.message;
    } else if (typeof props.error === 'string') {
      msg = props.error;
    }
    // get error message's translation from locale
    const errorTranslation = te(msg) ? t(msg) : t('errors.unknown');
    return errorTranslation;
  });
</script>

<template>
  <div role="alert" class="py-9 text-center flex flex-col justify-center items-center opacity-70">
    <ErrorIcon class="w-24 h-24" aria-hidden="true" focusable="false"/>
    <div>{{ message }}</div>
  </div>
</template>