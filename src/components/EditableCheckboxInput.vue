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
  disabled?: boolean,
  lineThroughIfChecked?: boolean
}>();
const isEditing = ref(false);
const editedItemInputEl = ref<HTMLInputElement | null>(null);
const newName = ref('');

const emit = defineEmits<{
  (e: 'nameChange', newValue: string): void
  (e: 'checkedChange', newValue: boolean): void
  (e: 'isEditingChange', newValue: boolean, item: ShoppingListItem ): void
}>();

async function editItem(item: ShoppingListItem) {
  isEditing.value = true;
  newName.value = item.name;
  emit('isEditingChange', isEditing.value, props.item);

  await nextTick();
  if (editedItemInputEl.value) {
    editedItemInputEl.value.focus();
  }
}

function cancelEditingItem() {
  isEditing.value = false;
  newName.value = '';
  emit('isEditingChange', isEditing.value, props.item);
}

function confirmEditingItem() {
  if (newName.value) {
    isEditing.value = false;
    emit('nameChange', newName.value);
    emit('isEditingChange', isEditing.value, props.item);
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
        :line-through-if-checked="props.lineThroughIfChecked"
        @click="(event: Event) => setItemChecked(props.item, event)"
      />
      <IconButton
        v-if="!props.disabled"
        class="ml-2"
        @click="editItem(props.item)"
        aria-label="Edit item"
      >
        <EditIcon class="w-5 h-5" aria-hidden focusable="false"/>
      </IconButton>
    </div>
    <div v-if="isEditing" class="flex justify-between items-center w-full">
      <input
        ref="editedItemInputEl"
        v-model="newName"
        @keypress.enter="confirmEditingItem"
        @keyup.esc="cancelEditingItem"
      />
      <Button
        type="primary"
        class="ml-1"
        aria-label="Confirm editing"
        @click="confirmEditingItem"
      >
        <CheckIcon class="w-6 h-6 text-white" aria-hidden focusable="false"/>
      </Button>
    </div>
  </div>
</template>
