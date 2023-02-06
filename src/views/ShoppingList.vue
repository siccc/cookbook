<script setup lang="ts">
import { ref, computed, watch, onMounted, Teleport } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { isMobile } from '@/stores/utility';
import { getShoppingList, useUpdateShoppingListMutation } from '@/stores/shoppingList';
import type { ShoppingList, ShoppingListItem } from '@/types';
import Button from '@/components/Button.vue';
import IconButton from '@/components/IconButton.vue';
import EditableCheckboxInput from '@/components/EditableCheckboxInput.vue';
import PlusIcon from '@/assets/icons/plus.svg?component';
import CloseIcon from '@/assets/icons/close.svg?component';
import Modal from '@/components/Modal.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingState from '@/components/LoadingState.vue';

const useMobile = isMobile();
const showModal = ref(false);
const showItemDelete = ref(true);
const newItemInputEl = ref<HTMLInputElement | null>(null);
const newItem = ref('');
const { isLoading, isError, data, error} = getShoppingList();
const list = ref<ShoppingListItem[]|undefined>(undefined);
const updateShoppingListMutation = useUpdateShoppingListMutation();

onMounted(() => {
  if (!useMobile) {
    newItemInputEl.value?.focus();
  }
})

// copy shopping list data to be able to mutate it's properties
watch(
  data, (data) => {
    if (data) {
      list.value = JSON.parse(JSON.stringify(data.items));
    }
  },
  { immediate:true }
);

const listLength = computed(() => {
  return list.value && list.value ? list.value.length : 0;
});

function setShowItemDelete(isEditing: boolean) {
  showItemDelete.value = !isEditing;
}

function setItemChecked(item: ShoppingListItem, newValue: boolean) {
  item.checked = newValue;
  debouncedSaveChanges();
}

function setItemName(item: ShoppingListItem, newName: string) {
  item.name = newName;
  debouncedSaveChanges();
}

function removeAllChecked() {
  if (!list.value) {
    return;
  }
  list.value = list.value.filter(item => !item.checked);
  debouncedSaveChanges();
}

function removeItem(itemToRemove: ShoppingListItem) {
  if (!list.value) {
    return;
  }
  list.value = list.value.filter((item) => item !== itemToRemove);
  debouncedSaveChanges();
}

function addItems(event: Event) {
  const inputValue = (event.target as HTMLInputElement).value;
  const newItems = inputValue.split(",");
  newItems.forEach(newItem => {
    if (list.value) {
      list.value.push({ checked: false, name: newItem.trim() });
    }
  });
  debouncedSaveChanges();
}

function onClickShowModal() {
  showModal.value = true;
}

function onClickCancelModal() {
  showModal.value = false;
}

const debouncedSaveChanges = useDebounceFn(() => {
  saveChanges();
}, 1000, { maxWait: 5000 })

function saveChanges() {
  if (data.value?.id && list.value) {
    const newShoppingList:ShoppingList = {
      id: data.value.id,
      items: list.value
    };
    updateShoppingListMutation.mutate(newShoppingList);
  }
}

</script>

<template>
  <main class="p-6 md:p-9 max-w-screen-sm mx-auto my-14">
    <div class="mt-3 mb-6 flex items-center justify-between">
      <h1 class="text-2xl text-center md:text-left">
        Shopping list
      </h1>
      <Button v-if="listLength !== 0" @click="onClickShowModal">Delete all checked</Button>
    </div>
    <LoadingState v-if="isLoading" />
    <ErrorState v-else-if="isError" :error="error" />
    <Teleport to="body">
      <Modal
        v-if="showModal"
        confirm-label="Delete"
        :is-confirm-danger="true"
        @close="onClickCancelModal"
        @cancel="onClickCancelModal"
        @confirm="removeAllChecked()"
        title="Delete all checked items?"
      >
        Are you sure you want to delete permanently all checked items?
      </Modal>
    </Teleport>
    <div class="divide-y" v-auto-animate>
      <div v-for="(item) in list" class="py-3 flex items-center">
        <EditableCheckboxInput
          class="flex-1"
          :item="item"
          :line-through-if-checked="true"
          @checked-change="(event) => setItemChecked(item, event)"
          @name-change="(event) => setItemName(item, event)"
          @is-editing-change="(event) => setShowItemDelete(event)"
        />
        <IconButton
          v-show="showItemDelete"
          class="ml-2"
          @click="removeItem(item)"
          aria-label="Delete item"
        >
          <CloseIcon class="w-5 h-5" />
        </IconButton>
      </div>
    </div>
    <div class="mt-3 md:mt-6 flex items-center relative" v-if="!isLoading">
      <PlusIcon
        class="w-5 h-5 text-stone-300 absolute left-0 ml-3"
        aria-hidden="true"
        focusable="false"
      />
      <input
        ref="newItemInputEl"
        class="inputWithIcon"
        :value="newItem"
        placeholder="Add new items (separated by &quot;,&quot; )"
        @keypress.enter="addItems"
      />
    </div>
    <EmptyState
      v-if="listLength === 0 && !isLoading"
      message="Your shopping list is empty. Start adding products you need to buy."
      type="default"
    />
  </main>
</template>