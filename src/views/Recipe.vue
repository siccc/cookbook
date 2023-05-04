<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import { getRecipe, useDeleteRecipeMutation, useUpdateRecipeMutation } from '@/stores/recipes';
import type { Recipe } from '@/types';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';
import Modal from '@/components/Modal.vue';
import Button from '@/components/Button.vue';
import AddToShoppingListModal from '@/components/AddToShoppingListModal.vue';
import EmptyStarIcon from '@/assets/icons/star.svg?component';
import FullStarIcon from '@/assets/icons/full-star.svg?component';
import DeleteIcon from '@/assets/icons/trash-alt.svg?component';
import ClockIcon from '@/assets/icons/clock.svg?component';
import ServingsIcon from '@/assets/icons/utensils.svg?component';
import EditIcon from '@/assets/icons/edit.svg?component';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import BackIcon from '@/assets/icons/angle-left-b.svg?component';
import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
import ErrorState from '@/components/ErrorState.vue';
import LoadingState from '@/components/LoadingState.vue';
import Image from '@/components/Image.vue';

const props = defineProps<{
  id: string
}>();

const scrollPosition = ref(0);
const router = useRouter();
const isCounterClicked = ref(false);
const showDeleteConfirmModal = ref(false);
const showAddToShoppingListModal = ref(false);
const {
  isLoading,
  isError,
  data:recipe,
  error
} = getRecipe(props.id);
const deleteRecipeMutation = useDeleteRecipeMutation();
const updateRecipeMutation = useUpdateRecipeMutation();

const totalTime = computed<number>(() => {
  if (!recipe.value) {
    return 0;
  }
  return (recipe.value.cookTime || 0) + (recipe.value.prepTime || 0);
});

// -----------------------------------
// METHODS
// -----------------------------------

function onDelete(recipe: Recipe) {
  deleteRecipeMutation.mutate(
    recipe,
    { onSuccess: () => router.push('/') }
  );
}

function onCounterClick(recipe: Recipe) {
  isCounterClicked.value = true;
  const newRecipe = JSON.parse(JSON.stringify(recipe));
  newRecipe.cookedCount = newRecipe.cookedCount + 1;
  updateRecipeMutation.mutate(newRecipe);
}

function onBackClick() {
  router.push('/');
}

function onDeleteConfirmShow() {
  showDeleteConfirmModal.value = true;
}

function onDeleteConfirmCancel() {
  showDeleteConfirmModal.value = false;
}

function onAddToShoppingListShow() {
  showAddToShoppingListModal.value = true;
}

function onAddToShoppingListCancel() {
  showAddToShoppingListModal.value = false;
}

const updateScroll = useThrottleFn(() => {
  scrollPosition.value = window.scrollY;
}, 250, true);

onMounted(() => {
  window.addEventListener('scroll', updateScroll);
});

</script>

<template>
  <main class="max-w-screen-lg mx-auto mb-6 md:mb-20 md:mt-14">
    <LoadingState v-if="isLoading" class="p-12" />
    <ErrorState v-if="isError" :error="error" />
    <div v-else-if="!isLoading && recipe">
      <!-- NAV & ACTIONS -->
      <!-- MOBILE -->
      <div class="fixed w-full z-20 top-0 left-0 md:hidden transition-colors duration-200"
        :class="{ 'bg-white border-b border-stone-200 shadow-sm': scrollPosition > 100 }"
      >
        <div class="flex justify-between items-center p-3">
          <Button type="white" @click="onBackClick">
            <BackIcon class="w-6 h-6" />
          </Button>
          <div class="flex items-center">
            <Button type="white" class="mr-6" :to="`/edit/${props.id}`">
              <EditIcon class="w-6 h-6" />
            </Button>
            <Button
              type="white"
              :disabled="deleteRecipeMutation.isLoading.value"
              @click="onDeleteConfirmShow"
            >
              <DeleteIcon class="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
      <!-- DESKTOP -->
      <div class="hidden md:block">
        <div class="flex justify-between items-center p-3 pt-6">
          <Button @click="onBackClick">
            <BackIcon class="w-6 h-6" />
            Back
          </Button>
          <div class="flex items-center">
            <Button class="mr-3" :to="`/edit/${props.id}`">
              <EditIcon class="w-6 h-6 mr-1" />
              Edit
            </Button>
            <Button @click="onDeleteConfirmShow" :disabled="deleteRecipeMutation.isLoading.value">
              <SpinnerIcon
                v-if="deleteRecipeMutation.isLoading.value"
                class="w-6 h-6 animate-spin mr-2"
              />
              <DeleteIcon v-else class="w-6 h-6 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      <Teleport to="body">
        <Modal
          v-if="showDeleteConfirmModal"
          confirm-label="Delete"
          confirm-button-type="danger"
          title="Delete recipe?"
          @close="onDeleteConfirmCancel"
          @cancel="onDeleteConfirmCancel"
          @confirm="onDelete(recipe!)"
        >
          Are you sure you want to permanently delete this recipe? You can't undo this action.
        </Modal>
      </Teleport>
      <div class="md:grid md:grid-cols-3 md:justify-items-start flex flex-col">
        <!-- IMAGE -->
        <div class="w-full md:p-3">
          <Image
            v-if="recipe.imagePublicId"
            imgClass="w-full h-96 object-cover md:rounded-xl"
            :imagePublicId="recipe.imagePublicId"
            imgSizeSmall="h_420,w_420"
            imgSizeLarge="h_460,w_780"
            imgSizeDefault="h_420,w_350"
          />
          <div v-else class="w-full h-96 rounded-b-xl rounded-t-none md:rounded-xl bg-stone-100
            flex justify-center items-center">
            <ImagePlaceholder class="opacity-10 w-40 h-40"/>
          </div>
        </div>
        <!-- INFO -->
        <div class="md:col-span-2 pt-6 md:pt-3 md:mt-0 p-3 rounded-t-3xl md:rounded-none -mt-10
          bg-white w-full">
          <div class="uppercase font-k2d text-2xl text-center md:text-start">
            {{ recipe.title }}
          </div>
          <!-- TAGS -->
          <div class="mt-3 flex justify-center md:justify-start flex-wrap">
            <span class="inline-block text-stone-400 uppercase">
              {{ recipe.category }}
            </span>
            <div class="flex items-center ml-3" v-for="tag in recipe.tags" :key="tag.id">
              <span class="bg-stone-400 rounded-full w-1 h-1 mr-3 inline-block" />
              <span class="inline-block text-stone-400 uppercase">{{ tag.name }}</span>
            </div>
          </div>
          <!-- TIME & SERVINGS -->
          <div class="mt-3 grid grid-cols-3 md:grid-cols-4 gap-3 justify-around md:justify-start
            p-3 rounded-lg border-2 border-sky-100">
            <div class="hidden md:block">
              <div class="uppercase text-stone-300">Servings</div>
              <div class="flex items-center">
                <ServingsIcon
                  class="w-6 h-6 text-sky-200 mr-1"
                  aria-hidden="true"
                  focusable="false"
                />
                <span>{{ recipe.servings }}</span>
              </div>
            </div>
            <div>
              <div class="uppercase text-stone-300">Prep</div>
              <div class="flex items-center">
                <ClockIcon
                  class="w-6 h-6 text-yellow-300 mr-1"
                  aria-hidden="true"
                  focusable="false"
                />
                <span>{{ recipe.prepTime }} min</span>
              </div>
            </div>
            <div>
              <div class="uppercase text-stone-300">Cook</div>
              <div class="flex items-center">
                <ClockIcon
                  class="w-6 h-6 text-yellow-300 mr-1"
                  aria-hidden="true"
                  focusable="false"
                />
                <span>{{ recipe.cookTime }} min</span>
              </div>
            </div>
            <div>
              <div class="uppercase text-stone-300">Total</div>
              <div class="flex items-center">
                <ClockIcon
                  class="w-6 h-6 text-yellow-300 mr-1"
                  aria-hidden="true"
                  focusable="false"
                />
                <span>{{ totalTime }} min</span>
              </div>
            </div>
          </div>
        </div>
        <!-- INGREDIENTS -->
        <div class="md:my-0 w-full p-3">
          <div class="flex items-center justify-between mb-1">
            <div class="text-xl uppercase font-k2d">Ingredients</div>
            <div class="flex md:hidden px-3 py-1.5 rounded-md bg-sky-50">
              <ServingsIcon class="w-6 h-6 text-sky-200 mr-1" />
              <span>{{ recipe.servings }}</span>
            </div>
          </div>
          <MarkdownRenderer :content="recipe.ingredients" />
          <Button class="w-full mt-4" @click="onAddToShoppingListShow">
            Add to shopping list
          </Button>
        </div>
        <AddToShoppingListModal
          v-if="showAddToShoppingListModal"
          :ingredient-list="recipe.ingredients"
          @close="onAddToShoppingListCancel"
          @cancel="onAddToShoppingListCancel"
          @confirm="onAddToShoppingListCancel"
        />
        <!-- STEPS & NOTES -->
        <div class="md:col-span-2 md:my-0 p-3 w-full">
          <div class="text-xl uppercase font-k2d mb-1">Steps</div>
          <MarkdownRenderer :content="recipe.steps" />
          <div v-if="recipe.notes">
            <div class="text-xl uppercase font-k2d mb-1 mt-6">Notes</div>
            <MarkdownRenderer :content="recipe.notes" />
          </div>
          <div class="flex justify-center">
            <Button
              type="primary"
              class="w-full md:w-60 mt-6 md:mt-6"
              @click="onCounterClick(recipe!)"
              :disabled="updateRecipeMutation.isLoading.value"
            >
              <SpinnerIcon
                v-if="updateRecipeMutation.isLoading.value"
                class="w-6 h-6 animate-spin mr-1"
                aria-label="Loading"
              />
              <EmptyStarIcon
                v-else-if="!isCounterClicked"
                class="w-6 h-6 mr-1 opacity-60"
                aria-hidden="true"
                focusable="false"
              />
              <FullStarIcon
                v-else-if="isCounterClicked"
                class="w-6 h-6 mr-2 opacity-60"
                aria-hidden="true"
                focusable="false"
              />
              I made it!
              ({{ recipe.cookedCount }})
            </Button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
