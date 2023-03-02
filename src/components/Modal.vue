<script setup lang="ts">
import Button from '@/components/Button.vue';
import { onMounted, onUnmounted, ref } from 'vue';

export interface Props {
  title: string,
  message?: string
  cancelLabel?: string
  confirmLabel?: string
  isConfirmPrimary?: boolean,
  isConfirmDanger?: boolean,
  showConfirmButton?: boolean,
  showCancelButton?: boolean,
  showTitle?: boolean,
  isScrollable?: boolean
}

const appEl = document.getElementById('app') as HTMLElement;
const modalEl = ref<HTMLElement | null>(null);
const props = withDefaults(defineProps<Props>(), {
  isConfirmPrimary: false,
  isConfirmDanger: false,
  isScrollable: false,
  showConfirmButton: true,
  showCancelButton: true,
  showTitle: true
});

onMounted(() => {
  appEl.setAttribute('inert', 'true');
  document.body.classList.add('overflow-hidden');
  if (modalEl.value) {
    modalEl.value.focus();
  }
});

onUnmounted(() => {
  appEl.removeAttribute('inert');
  document.body.classList.remove('overflow-hidden');
});

const emit = defineEmits<{
  (e: 'cancel', event: Event): void
  (e: 'confirm', event: Event): void
  (e: 'close', event: Event): void
}>();

function onCancel(event: Event) {
  emit('cancel', event);
  emit('close', event);
}

function onConfirm(event: Event) {
  emit('confirm', event);
  emit('close', event);
}

</script>

<template>
  <div
    ref="modalEl"
    role="dialog"
    aria-modal="true"
    :aria-label="props.title"
    tabindex="0"
    @keyup.esc="onCancel"
    class="fixed z-50 top-0 left-0 flex flex-col items-center justify-center w-screen h-full"
    :class="{ 'scrollable': props.isScrollable }"
  >
    <div class="absolute w-full h-full bg-stone-800/80" @mousedown="onCancel" />
    <div
      class="modalContent bg-white sm:w-96 text-center z-20 outline-none
        w-full absolute bottom-0 rounded-t-xl sm:rounded-b-xl sm:relative sm:bottom-auto
        pb-9 sm:pb-6 flex flex-col"
    >
      <div
        class="modalHeader font-medium text-xl p-6"
        :class="{ 'border-b': props.isScrollable }"
        v-if="props.showTitle"
      >
        {{ props.title }}
      </div>
      <div
        class="modalBody flex-1 text-stone-600 px-6 overflow-y-auto"
        :class="{ 'pt-6': !props.showTitle }"
      >
        <slot>
          {{ props.message }}
        </slot>
      </div>
      <!-- FOOTER -->
      <div
        class="modalFooter"
        :class="{ 'border-t': props.isScrollable }"
      >
        <slot name="footer">
          <div class="flex justify-between items-center gap-3 px-6 mt-6">
            <Button
              ref="cancelButton"
              v-if="props.showCancelButton"
              class="flex-1 uppercase"
              @click="onCancel"
            >
              {{ props.cancelLabel || 'Cancel' }}
            </Button>
            <Button
              ref="confirmButton"
              v-if="props.showConfirmButton"
              class="flex-1 uppercase"
              :primary="props.isConfirmPrimary"
              :danger="props.isConfirmDanger"
              @click="onConfirm"
            >
              {{ props.confirmLabel || 'OK' }}
            </Button>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modalFooter {
  padding-bottom: env(safe-area-inset-bottom);
}
.scrollable .modalContent {
  max-height: calc(100% - 3.5rem);
}
</style>