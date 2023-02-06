<script setup lang="ts">
import { ref, nextTick } from 'vue';
import type { ShoppingListItem } from '@/types';
import Checkbox from '@/components/Checkbox.vue';
import Button from '@/components/Button.vue';
import IconButton from '@/components/IconButton.vue';
import EditIcon from '@/assets/icons/pen.svg?component';
import CheckIcon from '@/assets/icons/check.svg?component';

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
    emit('isEditingChange', isEditing.value);
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
      <IconButton
        class="ml-2"
        @click="editItem(props.item)"
        aria-label="Edit item"
      >
        <EditIcon class="w-5 h-5" />
      </IconButton>
    </div>
    <div v-if="isEditing" class="flex justify-between items-center w-full">
      <input
        ref="editedItemInputEl"
        v-model="newName"
        @keypress.enter="confirmEditingItem"
        @keyup.esc="cancelEditingItem"
      />
      <Button primary @click="confirmEditingItem" class="ml-1" aria-label="Confirm editing">
        <CheckIcon class="w-6 h-6 text-white" />
      </Button>
    </div>
  </div>
</template>
