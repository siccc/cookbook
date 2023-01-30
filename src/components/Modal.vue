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
  showTitle?: boolean
}


const props = withDefaults(defineProps<Props>(), {
  isConfirmPrimary: false,
  isConfirmDanger: false,
  showConfirmButton: true,
  showCancelButton: true,
  showTitle: true
})


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
    v-if="props.show"
    class="fixed z-50 top-0 left-0 flex flex-col items-center justify-center w-screen h-screen p-6"
  >
    <div class="absolute w-full h-full bg-stone-800/80" @mousedown="onCancel" />
    <div
      class="px-6 py-6 bg-white sm:w-96 text-center z-20 outline-none
        w-full absolute bottom-0 rounded-t-xl sm:rounded-b-xl sm:relative sm:bottom-auto"
    >
      <div class="font-medium text-xl" v-if="props.showTitle">{{ props.title }}</div>
      <div class="text-stone-600 py-6">
        <slot>
          {{ props.message }}
        </slot>
      </div>
      <!-- FOOTER -->
      <div class="flex justify-between items-center gap-3">
        <slot name="footer">
          <Button
            v-if="props.showCancelButton"
            class="flex-1 uppercase"
            @click="onCancel"
          >
            {{ props.cancelLabel || 'Cancel' }}
          </Button>
          <Button
            v-if="props.showConfirmButton"
            class="flex-1 uppercase"
            :primary="props.isConfirmPrimary"
            :danger="props.isConfirmDanger"
            @click="onConfirm"
          >
            {{ props.confirmLabel || 'OK' }}
          </Button>
        </slot>
      </div>
    </div>
  </div>
</template>