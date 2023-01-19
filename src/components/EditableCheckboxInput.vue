<script setup lang="ts">
import Checkbox from '@/components/Checkbox.vue';
import EditIcon from '@/assets/icons/pen.svg?component';
import CheckIcon from '@/assets/icons/check.svg?component';
import type { ShoppingListItem } from '@/types';
import { ref, nextTick } from 'vue';

const props = defineProps<{
  item: ShoppingListItem,
  lineThroughIfChecked?: boolean
}>();
const isEditing = ref(false);
const editedItemInputEl = ref<HTMLInputElement | null>(null);
const newName = ref('');

const emit = defineEmits<{
  (e: 'nameChange', newValue: string): void
  (e: 'checkedChange', newValue: boolean): void
  (e: 'isEditingChange', newValue: boolean): void
}>();

async function editItem(item: ShoppingListItem) {
  isEditing.value = true;
  newName.value = item.name;
  emit('isEditingChange', isEditing.value);

  await nextTick();
  if (editedItemInputEl.value) {
    editedItemInputEl.value.focus();
  }
}

function cancelEditingItem() {
  isEditing.value = false;
  newName.value = '';
  emit('isEditingChange', isEditing.value);
}

function confirmEditingItem() {
  if (newName.value) {
    isEditing.value = false;
    emit('nameChange', newName.value);
  }
}

function setItemChecked(item: ShoppingListItem, event: Event) {
  item.checked = (event.target as HTMLInputElement).checked;
  emit('checkedChange', item.checked);
}

</script>

<template>
  <div>
    <div v-if="!isEditing" class="flex justify-between items-center w-full">
      <Checkbox
        class="flex-1"
        :value="props.item.checked"
        :label="props.item.name"
        :line-through-if-checked="lineThroughIfChecked"
        @click="(event: Event) => setItemChecked(props.item, event)"
      />
      <div class="py-0.5 px-2 cursor-pointer" @click="editItem(props.item)">
        <EditIcon class="w-4 h-4 text-stone-500" />
      </div>
    </div>
    <div v-if="isEditing" class="flex justify-between items-center w-full">
      <input
        ref="editedItemInputEl"
        v-model="newName"
        @keypress.enter="confirmEditingItem"
        @keyup.esc="cancelEditingItem"
      />
      <div
        class="ml-1 py-3 px-3 sm:p-2 cursor-pointer bg-yellow-400 rounded-md"
        @click="confirmEditingItem"
      >
        <CheckIcon class="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
</template>
