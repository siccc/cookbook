<script setup lang="ts">
import { getCurrentMonth, getSeasonalFoodsByMonth, getMonths } from '@/stores/seasonalFoods';
import { getShoppingList, useUpdateShoppingListMutation } from '@/stores/shoppingList';
import { computed, ref, watch } from 'vue';
import { useScroll } from '@vueuse/core';
import type { Food, FoodList, ShoppingList } from '@/types';
import Modal from '@/components/Modal.vue';
import SelectInput from '@/components/SelectInput.vue';
import Button from '@/components/Button.vue';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import SvgSprite from '@/components/SvgSprite.vue';
import CheckIcon from '@/assets/icons/check.svg?component';

const showModal = ref(false);
const selectedFood = ref<Food | null>(null);
const selectedFoodType = ref('');
const showSaveSuccessMessage = ref(false);
const shortMonths = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const { y } = useScroll(window, { behavior: 'smooth' });

// -----------------------------------
// INIT
// -----------------------------------

const selectedMonth = ref('');
selectedMonth.value = getCurrentMonth();

const foods = ref<FoodList>({
  vegetables: [],
  fruits: []
});
foods.value = getSeasonalFoodsByMonth(selectedMonth.value);

const months = getMonths();
const parallaxEl = ref<HTMLInputElement | null>(null);
const { data:shoppingList } = getShoppingList();
const updateShoppingListMutation = useUpdateShoppingListMutation();

const sesonalBgClass = computed(() => {
  if (selectedMonth.value === '') {
    return '';
  }
  if (['January', 'February', 'December'].includes(selectedMonth.value)) {
    return 'bg-[url("@/assets/winter.png")]';
  } else if (['March', 'April', 'May'].includes(selectedMonth.value)) {
    return 'bg-[url("@/assets/spring.png")]';
  } else if (['June', 'July', 'August'].includes(selectedMonth.value)) {
    return 'bg-[url("@/assets/summer.png")]';
  } else if (['September', 'October', 'November'].includes(selectedMonth.value)) {
    return 'bg-[url("@/assets/autumn.png")]';
  }
});

watch(
  () => y.value,
  (y) => {
  if (parallaxEl.value) {
    parallaxEl.value.style.transform = `translateY(${y * 0.5}px)`;
  }
});

// -----------------------------------
// METHODS
// -----------------------------------

function onSelectedMonthChange(event: Event) {
  selectedMonth.value = (event.target as HTMLInputElement).value;
  foods.value = getSeasonalFoodsByMonth(selectedMonth.value);
}

function onClickShowModal(food: Food, foodType: string) {
  selectedFood.value = food;
  selectedFoodType.value = foodType;
  showModal.value = true;
}

function onClickCancelModal() {
  selectedFood.value = null;
  selectedFoodType.value = '';
  showModal.value = false;
}

async function onConfirm(event: Event) {
  await addItemsToShoppingList();
  await showSuccessMessage();
  showModal.value = false;
}

async function addItemsToShoppingList() {
  if (shoppingList.value?.id && selectedFood.value) {
    const newShoppingList:ShoppingList = {
      id: shoppingList.value.id,
      items: [
        ...shoppingList.value.items,
        {
          name: selectedFood.value.name_EN, checked: false
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
  <main class="mx-auto max-w-screen-xl mb-20">
    <div class="h-72 relative top-12 md:top-20 md:h-96 -z-10">
      <div
        ref="parallaxEl"
        class="absolute inset-0 bg-cover bg-bottom bg-no-repeat md:rounded-3xl"
        :class="[sesonalBgClass]"
      />
    </div>
    <div class="-mt-6 md:mt-0">
      <h1 class="text-center md:text-left px-6 md:mb-12 mb-6 md:ml-3">
        <span class="bg-sky-900/40 px-3 rounded-sm font-k2d text-2xl text-white">
          Seasonal foods in {{ selectedMonth }}
        </span>
      </h1>
      <div class="bg-white pt-3  rounded-t-3xl">
        <div class="flex justify-between items-center my-6 px-6">
          <div class="text-xl">Veggies</div>
          <div class="flex items-center">
            <div class="mr-3">Month:</div>
            <SelectInput
              class="w-32"
              :value="selectedMonth"
              :options="months"
              @change="onSelectedMonthChange"
            />
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 px-6">
          <button
            class="p-3 md:p-1 text-sky-800 bg-sky-100 rounded-lg leading-none flex
              items-center cursor-pointer"
            @click="onClickShowModal(veggie, 'vegetable')"
            v-for="veggie in foods.vegetables"
            :aria-label="`Open ${ veggie.name_EN } details`"
          >
            <div class="p-1 rounded-lg mr-1 text-sky-800/50">
              <SvgSprite
                :symbol="veggie.imageId || 'salad'"
                class="w-10 h-10"
                :class="{ 'text-sky-800/20': !veggie.imageId }"
              />
            </div>
            <div class="text-left">
              <div>{{ veggie.name_EN }}</div>
              <!-- <div class="text-xs mt-0.5">{{ veggie.name_HU }}</div> -->
            </div>
          </button>
        </div>
        <div class="text-xl mt-9 mb-6 px-6">Fruits</div>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 px-6">
          <button
            class="p-3 md:p-1 text-yellow-600 bg-amber-200 rounded-lg leading-none flex
              items-center cursor-pointer"
            @click="onClickShowModal(fruit, 'fruit')"
            v-for="fruit in foods.fruits"
            :aria-label="`Open ${fruit.name_EN} details`"
          >
            <div class="p-1 rounded-lg mr-1 text-amber-800/50">
              <SvgSprite
                :symbol="fruit.imageId || 'apple'"
                class="w-10 h-10"
                :class="{ 'text-amber-800/20': !fruit.imageId }"
              />
            </div>
            <div class="text-left">
              <div>{{ fruit.name_EN }}</div>
              <!-- <div class="text-xs mt-0.5">{{ fruit.name_HU }}</div> -->
            </div>
          </button>
        </div>
      </div>
      <!-- FOOD DETAILS MODAL -->
      <Teleport to="body">
        <Modal
          v-if="showModal"
          @close="onClickCancelModal"
          @cancel="onClickCancelModal"
          :show-title="false"
          confirm-label="Add to shopping list"
          title="Food details"
        >
          <div v-if="selectedFood && !showSaveSuccessMessage" class="flex flex-col items-center">
            <div
              class="uppercase font-k2d"
              :class="{
                'text-sky-600': selectedFoodType === 'vegetable',
                'text-yellow-500': selectedFoodType === 'fruit'
              }"
            >
              {{ selectedFood.name_EN }}
            </div>
            <!-- <div class="text-sm text-stone-400">{{ selectedFood.name_HU }}</div> -->
            <div class="text-sm mt-6 grid grid-cols-12 gap-3">
              <div
                v-for="(value, monthIndex) in selectedFood.inSeason_HU"
                class="rounded-sm px-3 py-0.5 flex items-center justify-center"
                :class="{
                  'bg-sky-200 text-sky-600': value && selectedFoodType === 'vegetable',
                  'bg-amber-200 text-yellow-500': value && selectedFoodType === 'fruit',
                  'bg-stone-100 text-stone-400': !value}"
              >
                {{ shortMonths[monthIndex] }}
              </div>
            </div>
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
            <Button
              class="flex-1 uppercase"
              @click="onConfirm"
              v-show="!showSaveSuccessMessage"
            >
              <SpinnerIcon
                v-if="updateShoppingListMutation.isLoading.value"
                class="w-6 h-6 animate-spin mr-2"
              />
              <span v-if="updateShoppingListMutation.isLoading.value">Saving...</span>
              <span v-else class="uppercase">Add to shopping list</span>
            </Button>
          </template>
        </Modal>
      </Teleport>
    </div>
  </main>
</template>
