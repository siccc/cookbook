<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { trimStart } from 'lodash';
import { getShoppingList, useUpdateShoppingListMutation } from '@/stores/shoppingList';
import type { ShoppingList, ShoppingListItem } from '@/types';
import Modal from '@/components/Modal.vue';
import EditableCheckboxInput from '@/components/EditableCheckboxInput.vue';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import CheckIcon from '@/assets/icons/check.svg?component';
import Button from '@/components/Button.vue';

const props = defineProps<{
  ingredientList: string
}>();

const { data } = getShoppingList();
const updateShoppingListMutation = useUpdateShoppingListMutation();
const showSaveSuccessMessage = ref(false);
const list = ref<ShoppingListItem[]>([]);
const shoppingList = ref<ShoppingListItem[]>([]);

const emit = defineEmits<{
  (e: 'cancel', event: Event): void
  (e: 'confirm', event: Event): void
  (e: 'close', event: Event): void
}>();

// copy shopping list data to be able to mutate it's properties
watch(
  data, (data) => {
    if (data) {
      shoppingList.value = JSON.parse(JSON.stringify(data.items));
    }
  },
  { immediate:true }
);

if (props.ingredientList) {
  let name = '';
  list.value = props.ingredientList.split('\n')
    .filter((item) => item.startsWith('- '))
    .map((item) => {
      name = trimStart(item, '- ');
      name = name.substring(0, name.indexOf(',')) || name;
      return { checked: true, name };
    });
}

const checkedListLenght = computed(() => {
  return list.value ? list.value.filter(item => item.checked).length : 0;
});

function setItemChecked(item: ShoppingListItem, newValue: boolean) {
  item.checked = newValue;
}

function setItemName(item: ShoppingListItem, newName: string) {
  item.name = newName;
}

function onCancel(event: Event) {
  emit('cancel', event);
  emit('close', event);
}

async function onConfirm(event: Event) {
  await addItemsToShoppingList();
  await showSuccessMessage();
  emit('confirm', event);
  emit('close', event);
}

async function addItemsToShoppingList() {
  const itemsToAdd = list.value.filter((item) => item.checked);
  if (data.value?.id && itemsToAdd.length > 0) {
    const newShoppingList:ShoppingList = {
      id: data.value.id,
      items: [...shoppingList.value, ...itemsToAdd.map((item) => ({
        name: item.name, checked: false
      }))]
    };
    try {
      return updateShoppingListMutation.mutateAsync(newShoppingList);
    } catch (error) {
      console.error(error);
    }
  }
}

async function showSuccessMessage() {
  return new Promise((resolve) => {
    showSaveSuccessMessage.value = true;
    setTimeout(() => {
      showSaveSuccessMessage.value = false;
      resolve(true);
    }, 2000);
  });
}

</script>

<template>
  <Teleport to="body">
    <Modal
      confirm-label="Add items"
      :is-confirm-primary="true"
      @cancel="onCancel"
      @confirm="onConfirm"
      title="Add to shopping list"
      :is-scrollable="true"
    > 
      <div class="text-left divide-y" v-show="!showSaveSuccessMessage">
        <div v-for="item in list" class="flex justify-between items-center py-2 md:py-1.5">
          <EditableCheckboxInput
            class="flex-1"
            :item="item"
            @checked-change="(event) => setItemChecked(item, event)"
            @name-change="(event) => setItemName(item, event)"
          />
        </div>
      </div>
      <div
        v-if="showSaveSuccessMessage"
        class="p-3 rounded-lg bg-sky-50 text-sky-800 text-sm text-center flex items-center
          justify-between my-3"
      >
        <div class="bg-sky-200 p-1.5 rounded-lg">
          <CheckIcon class="w-6 h-6 text-white" />
        </div>
        Items added successfully to shopping list.
      </div>
      <template v-slot:footer>
        <Button
          class="flex-1 uppercase"
          @click="onCancel"
          v-show="!showSaveSuccessMessage"
        >
          Cancel
        </Button>
        <Button
          class="flex-1 uppercase"
          primary
          @click="onConfirm"
          v-show="!showSaveSuccessMessage"
          :disabled="checkedListLenght === 0"
        >
          <SpinnerIcon
            v-if="updateShoppingListMutation.isLoading.value"
            class="w-6 h-6 animate-spin mr-2"
          />
          <span v-if="updateShoppingListMutation.isLoading.value">Saving...</span>
          <span v-else class="uppercase">Add items</span>
        </Button>
      </template>
    </Modal>
  </Teleport>
</template>