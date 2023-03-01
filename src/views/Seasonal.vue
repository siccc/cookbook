<script setup lang="ts">
import { getCurrentMonth, getSeasonalFoodsByMonth, getMonths } from '@/stores/seasonalFoods';
import { getShoppingList, useUpdateShoppingListMutation } from '@/stores/shoppingList';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import type { Food, FoodList, ShoppingList } from '@/types';
import Modal from '@/components/Modal.vue';
import SelectInput from '@/components/SelectInput.vue';
import Button from '@/components/Button.vue';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import SvgSprite from '@/components/SvgSprite.vue';
import CheckIcon from '@/assets/icons/check.svg?component';
import winterBg from '@/assets/winter.png';
import springBg from '@/assets/spring.png';
import summerBg from '@/assets/summer.png';
import autumnBg from '@/assets/autumn.png';

const showModal = ref(false);
const selectedFood = ref<Food | null>(null);
const selectedFoodType = ref('');
const showSaveSuccessMessage = ref(false);
const shortMonths = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

// -----------------------------------
// INIT
// -----------------------------------

const selectedMonth = ref('');
const selectedMonthIndex = ref(0);
const { month: initialMonth, monthIndex: initialMonthIndex }= getCurrentMonth();
selectedMonth.value = initialMonth;
selectedMonthIndex.value = initialMonthIndex;

const foods = ref<FoodList>({
  vegetables: [],
  fruits: []
});
foods.value = getSeasonalFoodsByMonth(selectedMonth.value);

const months = getMonths();
const parallaxEl = ref<HTMLInputElement | null>(null);
const { data:shoppingList } = getShoppingList();
const updateShoppingListMutation = useUpdateShoppingListMutation();
const images = {
  winter: winterBg,
  spring: springBg,
  summer: summerBg,
  autumn: autumnBg
};

const sesonalBgStyle = computed(() => {
  if (selectedMonth.value === '' || !parallaxEl.value) {
    return '';
  }
  if (['January', 'February', 'December'].includes(selectedMonth.value)) {
    return { backgroundImage: `url(${ winterBg })` };
  } else if (['March', 'April', 'May'].includes(selectedMonth.value)) {
    return { backgroundImage: `url(${ springBg })` };
  } else if (['June', 'July', 'August'].includes(selectedMonth.value)) {
    return { backgroundImage: `url(${ summerBg })` };
  } else if (['September', 'October', 'November'].includes(selectedMonth.value)) {
    return { backgroundImage: `url(${ autumnBg })` };
  }
});

onMounted(() => {
  preloadImages(images);
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
});

// -----------------------------------
// METHODS
// -----------------------------------

function handleScroll() {
  const scrollTop = window.pageYOffset;
  const speed = 0.3;
  const offset = scrollTop * speed;

  window.requestAnimationFrame(() => {
    if (parallaxEl.value) {
      parallaxEl.value.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
  });
}

async function preloadImages(images: { [key: string]: string }) {
  const promises = Object.values(images).map(loadImage);
  await Promise.all(promises);
}

function loadImage(imageSrc: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => reject(new Error(`Failed to load image ${imageSrc}`));
    img.src = imageSrc;
  });
}

function onSelectedMonthChange(event: Event) {
  selectedMonth.value = (event.target as HTMLInputElement).value;
  selectedMonthIndex.value = months.indexOf(selectedMonth.value);
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
    <div class="relative overflow-hidden -z-10 h-80 md:h-[30rem]">
      <div
        ref="parallaxEl"
        class="parallax-bg transition-[transform] ease-out duration-75 md:transition-none"
        :style="sesonalBgStyle"
      />
      <h1 class="text-center md:text-left px-6 mb-6 md:ml-3 absolute bottom-6 md:bottom-12">
        <span class="bg-sky-900/50 px-3 rounded-sm font-k2d text-2xl text-white leading-relaxed">
          Local seasonal foods in {{ selectedMonth }}
        </span>
      </h1>
    </div>
    <div class="-mt-6 md:-mt-12">
      <div class="bg-white pt-3 rounded-t-3xl">
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
              <div class="text-xs mt-0.5">{{ veggie.name_HU }}</div>
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
              <div class="text-xs mt-0.5">{{ fruit.name_HU }}</div>
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
              class="uppercase font-k2d flex items-center"
              :class="{
                'text-sky-600': selectedFoodType === 'vegetable',
                'text-yellow-500': selectedFoodType === 'fruit'
              }"
            >
              {{ selectedFood.name_EN }}
              <span
                v-if="selectedFood.stored_HU && selectedFood.stored_HU[selectedMonthIndex]"
                class="bg-stone-100 px-1 rounded-sm text-stone-600 text-xs ml-1"
              >
                stored
              </span>
            </div>
            <div class="text-sm text-stone-400">{{ selectedFood.name_HU }}</div>
            <div class="text-sm text-stone-400 mt-6 mb-1 text-left w-full">Months</div>
            <div class="text-sm grid grid-cols-12 gap-3">
              <div
                v-for="(value, monthIndex) in selectedFood.inSeason_HU"
                class="rounded-sm px-3 py-0.5 flex items-center justify-center font-medium"
                :class="{
                  'bg-sky-300 text-sky-800': value && selectedFoodType === 'vegetable',
                  'bg-sky-100 text-sky-600': selectedFood.stored_HU && selectedFood.stored_HU[monthIndex] && selectedFoodType === 'vegetable',
                  'bg-amber-400 text-yellow-800/70': value && selectedFoodType === 'fruit',
                  'bg-amber-200 text-yellow-600': selectedFood.stored_HU && selectedFood.stored_HU[monthIndex] && selectedFoodType === 'fruit',
                  'bg-stone-100 text-stone-500': (selectedFood.stored_HU && !selectedFood.stored_HU[monthIndex] && !value) || (!selectedFood.stored_HU && !value),
                }"
              >
                {{ shortMonths[monthIndex] }}
              </div>
            </div>
            <div class="text-sm mt-3 flex flex-col items-start self-start">
              <div class="flex items-center justify-center">
                <div
                  class="w-3 h-3 rounded-full mr-1" 
                  :class="{
                    'bg-sky-400': selectedFoodType === 'vegetable',
                    'bg-amber-400': selectedFoodType === 'fruit'
                  }"
                />
                seasonal
              </div>
              <div class="flex items-center justify-center">
                <div
                  class="w-3 h-3 rounded-full mr-1" 
                  :class="{
                    'bg-sky-200': selectedFoodType === 'vegetable',
                    'bg-amber-200': selectedFoodType === 'fruit'
                  }"
                />
                out of season but available (stored)
              </div>
              <div class="flex items-center justify-center">
                <div class="w-3 h-3 rounded-full bg bg-stone-200 mr-1" />
                out of season
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

<style scoped>
.parallax-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-position: bottom;
  background-size: cover;
  transform: translate3d(0, 0, 0);
}
</style>