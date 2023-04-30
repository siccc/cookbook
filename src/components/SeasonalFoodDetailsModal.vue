<script setup lang="ts">
import Modal from '@/components/Modal.vue';
import { getMonths } from '@/stores/seasonalFoods';
import { getShoppingList, useUpdateShoppingListMutation } from '@/stores/shoppingList';
import type { Food, ShoppingList } from '@/types';
import Button from '@/components/Button.vue';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import CheckIcon from '@/assets/icons/check.svg?component';
import { ref, computed } from 'vue';

const props = defineProps<{
  selectedFood: Food,
  selectedFoodType: string,
  currentMonthIndex: number
}>();

const emit = defineEmits<{
  (e: 'close', event: Event): void
}>();

const { data:shoppingList } = getShoppingList();
const updateShoppingListMutation = useUpdateShoppingListMutation();
const showSaveSuccessMessage = ref(false);
const shortMonths = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const months = getMonths();

const seasonalCalendarForFood = computed(() => {
  return shortMonths.map((month, index) => {
    if ((props.selectedFood.stored_HU && !props.selectedFood.stored_HU[index] && !props.selectedFood.inSeason_HU[index]) ||
      (!props.selectedFood.stored_HU && !props.selectedFood.inSeason_HU[index])) {
      return 'unavailable';
    } else if (props.selectedFood.inSeason_HU[index]) {
      return 'inSeason';
    } else if (props.selectedFood.stored_HU && props.selectedFood.stored_HU[index]) {
      return 'stored';
    }
  });
});

// -----------------------------------
// METHODS
// -----------------------------------

function onCancel(event: Event) {
  emit('close', event);
}

async function onConfirm(event: Event) {
  await addItemsToShoppingList();
  await showSuccessMessage();
  emit('close', event);
}

async function addItemsToShoppingList() {
  if (shoppingList.value?.id && props.selectedFood) {
    const newShoppingList:ShoppingList = {
      id: shoppingList.value.id,
      items: [
        ...shoppingList.value.items,
        {
          name: props.selectedFood.name_EN, checked: false
        }
      ]
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
  <Modal
    @close="onCancel"
    @cancel="onCancel"
    :show-title="false"
    confirm-label="Add to shopping list"
    title="Food details"
  >
    <div v-if="props.selectedFood && !showSaveSuccessMessage" class="flex flex-col items-center">
      <div
        class="uppercase font-k2d flex items-center"
        :class="{
          'text-sky-600': props.selectedFoodType === 'vegetable',
          'text-yellow-500': props.selectedFoodType === 'fruit'
        }"
      >
        {{ props.selectedFood.name_EN }}
        <span
          v-if="props.selectedFood.stored_HU && props.selectedFood.stored_HU[currentMonthIndex]"
          class="bg-stone-100 px-1 rounded-sm text-stone-600 text-xs ml-1"
        >
          stored
        </span>
      </div>
      <!-- <div class="text-sm text-stone-400">{{ props.selectedFood.name_HU }}</div> -->
      <div class="text-sm text-stone-400 mt-6 mb-1 text-left w-full">Months</div>
      <div class="text-sm grid grid-cols-12 gap-3">
        <div
          v-for="(value, monthIndex) in props.selectedFood.inSeason_HU"
          class="rounded-sm px-3 py-0.5 flex items-center justify-center font-medium"
          :class="{
            'bg-sky-300 text-sky-800': seasonalCalendarForFood[monthIndex] === 'inSeason' && props.selectedFoodType === 'vegetable',
            'bg-sky-100 text-sky-600': seasonalCalendarForFood[monthIndex] === 'stored' && props.selectedFoodType === 'vegetable',
            'bg-amber-400 text-yellow-800/70': seasonalCalendarForFood[monthIndex] === 'inSeason' && props.selectedFoodType === 'fruit',
            'bg-amber-200 text-yellow-600': seasonalCalendarForFood[monthIndex] === 'stored' && props.selectedFoodType === 'fruit',
            'bg-stone-100 text-stone-500': seasonalCalendarForFood[monthIndex] === 'unavailable',
          }"
          :aria-label="`${ months[monthIndex] }: ${ 
            seasonalCalendarForFood[monthIndex] === 'inSeason' ?
              'in season' : 
            seasonalCalendarForFood[monthIndex] === 'stored' ? 
              'available (stored)' : 
              'out of season'
            }`"
        >
          {{ shortMonths[monthIndex] }}
        </div>
      </div>
      <section
        class="text-sm mt-3 flex flex-col items-start self-start"
        aria-label="legend for seasonal calendar"
      >
        <div class="flex items-center justify-center">
          <div
            class="w-3 h-3 rounded-full mr-1" 
            :class="{
              'bg-sky-400': props.selectedFoodType === 'vegetable',
              'bg-amber-400': props.selectedFoodType === 'fruit'
            }"
          />
          seasonal
        </div>
        <div class="flex items-center justify-center">
          <div
            class="w-3 h-3 rounded-full mr-1" 
            :class="{
              'bg-sky-200': props.selectedFoodType === 'vegetable',
              'bg-amber-200': props.selectedFoodType === 'fruit'
            }"
          />
          out of season but available (stored)
        </div>
        <div class="flex items-center justify-center">
          <div class="w-3 h-3 rounded-full bg bg-stone-200 mr-1" />
          out of season
        </div>
      </section>
    </div>
    <div
      v-if="showSaveSuccessMessage"
      class="p-3 rounded-lg bg-sky-50 text-sky-800 text-sm text-center flex items-center
        justify-between"
    >
      <div class="bg-sky-200 p-1.5 rounded-lg">
        <CheckIcon class="w-6 h-6 text-white" />
      </div>
      Item added successfully to shopping list.
    </div>
    <template v-slot:footer>
      <div class="px-6 mt-6" v-show="!showSaveSuccessMessage">
        <Button
          class="flex-1 uppercase"
          @click="onConfirm"
        >
          <SpinnerIcon
            v-if="updateShoppingListMutation.isLoading.value"
            class="w-6 h-6 animate-spin mr-2"
          />
          <span v-if="updateShoppingListMutation.isLoading.value">Saving...</span>
          <span v-else class="uppercase">Add to shopping list</span>
        </Button>
      </div>
    </template>
  </Modal>
</template>