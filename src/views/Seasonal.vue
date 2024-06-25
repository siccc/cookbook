<script setup lang="ts">
import { getCurrentMonth, getSeasonalFoodsByMonth, getMonths } from '@/stores/seasonalFoods';
import { computed, onMounted, onUnmounted, ref, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Food, FoodList } from '@/types';
import SelectInput from '@/components/SelectInput.vue';
import Button from '@/components/Button.vue';
import SeasonalFoodDetailsModalVue from '@/components/SeasonalFoodDetailsModal.vue';
import SvgSprite from '@/components/SvgSprite.vue';
import winterBg from '@/assets/winter.png';
import springBg from '@/assets/spring.png';
import summerBg from '@/assets/summer.png';
import autumnBg from '@/assets/autumn.png';
import { getUser } from '@/stores/user';

// tm is a locale messages getter - used for getting the months localized value here
const { tm } = useI18n();
const showModal = ref(false);
const selectedFood = ref<Food | null>(null);
const selectedFoodType = ref('');
const { data } = getUser();

// -----------------------------------
// INIT
// -----------------------------------

const selectedMonth = ref('');
const selectedMonthIndex = ref(0);
const { month: initialMonth, monthIndex: initialMonthIndex }= getCurrentMonth();
selectedMonth.value = initialMonth;
selectedMonthIndex.value = initialMonthIndex;
const lang = computed(() => data.value?.settings.lang || 'en');
const location = computed(() => data.value?.settings.location || 'hu');

const foods = ref<FoodList>({
  vegetables: [],
  fruits: []
});
foods.value = getSeasonalFoodsByMonth(selectedMonth.value);

const months = getMonths();
const parallaxEl = ref<HTMLInputElement | null>(null);
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
  if (['january', 'february', 'december'].includes(selectedMonth.value)) {
    return { backgroundImage: `url(${ winterBg })` };
  } else if (['march', 'april', 'may'].includes(selectedMonth.value)) {
    return { backgroundImage: `url(${ springBg })` };
  } else if (['june', 'july', 'august'].includes(selectedMonth.value)) {
    return { backgroundImage: `url(${ summerBg })` };
  } else if (['september', 'october', 'november'].includes(selectedMonth.value)) {
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

</script>

<template>
  <main class="mx-auto max-w-screen-xl mb-20">
    <div class="relative overflow-hidden -z-10 h-80 md:h-[30rem]">
      <div
        ref="parallaxEl"
        class="parallax-bg transition-[transform] ease-out duration-75"
        :style="sesonalBgStyle"
      />
      <h1 class="text-center md:text-left px-6 mb-6 md:ml-3 absolute bottom-6 md:bottom-12">
        <span class="bg-sky-900/50 px-3 rounded-sm font-k2d text-2xl text-white leading-relaxed">
          {{ $t("seasonal.title", { month: $t(`months.${ selectedMonth }`) }) }}
        </span>
      </h1>
    </div>
    <div class="-mt-6 md:-mt-12">
      <div class="bg-white pt-3 rounded-t-3xl">
        <div class="flex justify-between items-center my-6 px-6">
          <div class="text-xl">{{ $t("seasonal.vegetables") }}</div>
          <div class="flex items-center">
            <div class="mr-3">{{ $t("seasonal.month") }}:</div>
            <SelectInput
              class="w-32"
              :value="selectedMonth"
              :options="tm('months')"
              i18n-options
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
            :aria-label="`Open ${ veggie.id } details`"
          >
            <div class="p-1 rounded-lg mr-1 text-sky-800/50">
              <SvgSprite
                :symbol="veggie.imageId || 'salad'"
                class="w-10 h-10"
                :class="{ 'text-sky-800/20': !veggie.imageId }"
              />
            </div>
            <div class="text-left">
              <div>{{ $t(`food.${ veggie.id }`) }}</div>
            </div>
          </button>
        </div>
        <div class="text-xl mt-9 mb-6 px-6">{{ $t("seasonal.fruits") }}</div>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 px-6">
          <button
            class="p-3 md:p-1 text-yellow-600 bg-amber-200 rounded-lg leading-none flex
              items-center cursor-pointer"
            @click="onClickShowModal(fruit, 'fruit')"
            v-for="fruit in foods.fruits"
            :aria-label="`Open ${fruit.id} details`"
          >
            <div class="p-1 rounded-lg mr-1 text-amber-800/50">
              <SvgSprite
                :symbol="fruit.imageId || 'apple'"
                class="w-10 h-10"
                :class="{ 'text-amber-800/20': !fruit.imageId }"
              />
            </div>
            <div class="text-left">
              <div>{{ $t(`food.${ fruit.id }`) }}</div>
            </div>
          </button>
        </div>
      </div>
      <!-- FOOD DETAILS MODAL -->
      <Teleport to="body">
        <SeasonalFoodDetailsModalVue
          v-if="showModal"
          @close="onClickCancelModal"
          :selectedFood="selectedFood!"
          :selectedFoodType="selectedFoodType"
          :currentMonthIndex="selectedMonthIndex"
          :lang="lang"
          :location="location"
        />
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