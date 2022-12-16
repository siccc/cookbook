<script setup lang="ts">
import Button from '@/components/Button.vue';

export interface Props {
  show: boolean,
  title: string,
  message?: string
  cancelLabel?: string
  confirmLabel?: string
  isConfirmPrimary?: boolean,
  isConfirmDanger?: boolean,
  showConfirmButton?: boolean,
  showCancelButton?: boolean,
}

const {
  message,
  isConfirmPrimary = false,
  isConfirmDanger = false,
  showConfirmButton = true,
  showCancelButton = true,
} = defineProps<Props>();


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
    v-if="show"
    class="fixed z-50 top-0 left-0 flex flex-col items-center justify-center
      w-screen h-screen p-6"
  >
    <div class="absolute w-full h-full bg-stone-800/80" @mousedown="onCancel" />
    <div class="rounded-xl px-6 py-6 bg-white w-96 text-center z-20 outline-none">
      <div class="font-medium text-xl">{{ title }}</div>
      <div class="text-stone-600 py-3">
        <slot>
          {{ message }}
        </slot>
      </div>
      <!-- FOOTER -->
      <div class="mt-3 flex justify-between items-center gap-3">
        <Button
          class="flex-1 uppercase"
          @click="onCancel"
        >
          {{ cancelLabel || 'Cancel' }}
        </Button>
        <Button
          class="flex-1 uppercase"
          :primary="isConfirmPrimary"
          :danger="isConfirmDanger"
          @click="onConfirm"
        >
          {{ confirmLabel || 'OK' }}
        </Button>
      </div>
    </div>
  </div>
</template>