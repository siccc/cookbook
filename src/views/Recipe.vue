<script setup lang="ts">
import { getRecipe, useDeleteRecipeMutation, useUpdateRecipeMutation } from '@/stores/recipes';
import type { Recipe } from '@/types';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';
import Modal from '@/components/Modal.vue';
import Button from '@/components/Button.vue';
import EmptyStarIcon from '@/assets/icons/star.svg?component';
import FullStarIcon from '@/assets/icons/full-star.svg?component';
import DeleteIcon from '@/assets/icons/trash-alt.svg?component';
import EditIcon from '@/assets/icons/edit.svg?component';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import BackIcon from '@/assets/icons/angle-left-b.svg?component';
import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
import ErrorIcon from '@/assets/error.svg?component';
import LoadingIcon from '@/assets/loading-pot.svg?component';
import LoadingShadow from '@/assets/loading-shadow.svg?component';
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { useThrottleFn } from '@vueuse/core';

const props = defineProps<{
  id: number
}>();

const scrollPosition = ref(0);
const router = useRouter();
const isCounterClicked = ref(false);
const showModal = ref(false);
const { isLoading, isError, data:recipe, error } = getRecipe(props.id);
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
  document.body.classList.remove('modalOpen');
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
  if (window.history.state.back) {
    router.back();
  } else {
    router.push('/');
  }
}

function onClickShowModal() {
  showModal.value = true;
  document.body.classList.add('modalOpen');
}

function onClickCancelModal() {
  showModal.value = false;
  document.body.classList.remove('modalOpen');
}

const updateScroll = useThrottleFn(() => {
  scrollPosition.value = window.scrollY;
}, 100);

onMounted(() => {
  window.addEventListener('scroll', updateScroll);
});

</script>

<template>
  <div class="max-w-screen-lg mx-auto mb-6 md:mb-14 md:mt-14">
    <div v-if="isLoading" class="py-12 text-center font-k2d text-2xl text-yellow-400 flex flex-col justify-center items-center">
        <LoadingIcon class="w-24 opacity-80 animate-bounce block" />
        <LoadingShadow class="w-24 opacity-80 block" />
      Loading...
    </div>
    <div v-if="isError" class="py-12 text-center font-k2d text-xl text-red-300 flex justify-center items-center">
      <ErrorIcon class="w-24 h-24 opacity-50" />
      <div>{{ error }}</div>
    </div>
    <div v-else-if="!isLoading && recipe">
      <!-- NAV & ACTIONS -->
      <!-- MOBILE -->
      <div class="fixed w-full z-20 top-0 left-0 md:hidden transition-colors duration-200"
        :class="{ 'bg-white border-b border-stone-200 shadow-sm': scrollPosition > 100 }"
      >
        <div class="flex justify-between items-center p-3">
          <Button
            :custom-style="true"
            class="bg-white shadow shadow-stone-900/20 p-3 rounded-lg hover:bg-yellow-400 hover:text-white"
            @click="onBackClick"
          >
            <BackIcon class="w-6 h-6" />
          </Button>
          <div class="flex items-center">
            <Button
              :custom-style="true"
              class="bg-white mr-6 shadow shadow-stone-900/20 p-3 rounded-lg hover:bg-yellow-400 hover:text-white"
              :to="`/edit/${props.id}`"
            >
              <EditIcon class="w-6 h-6" />
            </Button>
            <Button
              :custom-style="true"
              class="bg-white shadow shadow-stone-900/20 p-3 rounded-lg hover:bg-yellow-400 hover:text-white"
              @click="onClickShowModal"
              :disabled="deleteRecipeMutation.isLoading.value"
            >
              <DeleteIcon class="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
      <!-- DESKTOP -->
      <div class="hidden md:block">
        <div class="flex justify-between items-center p-3 pt-6">
          <Button class="uppercase" @click="onBackClick">
            <BackIcon class="w-6 h-6" />
            Back
          </Button>
          <div class="flex items-center">
            <Button class="mr-3" :to="`/edit/${props.id}`">
              <EditIcon class="w-6 h-6 mr-1" />
              Edit
            </Button>
            <Button @click="onClickShowModal" :disabled="deleteRecipeMutation.isLoading.value">
              <SpinnerIcon v-if="deleteRecipeMutation.isLoading.value" class="w-6 h-6 animate-spin mr-2"/>
              <DeleteIcon v-else class="w-6 h-6 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      <Teleport to="body">
        <Modal
          :show="showModal"
          confirm-label="Delete"
          :is-confirm-danger="true"
          @close="onClickCancelModal"
          @cancel="onClickCancelModal"
          @confirm="onDelete(recipe!)"
          title="Delete recipe?"
        >
          Are you sure you want to permanently delete this recipe? You can't undo this action.
        </Modal>
      </Teleport>
      <div class="md:grid md:grid-cols-3 md:justify-items-start flex flex-col">
        <!-- IMAGE -->
        <div class="w-full md:p-3">
          <img v-if="recipe.imageUrl" class="w-full h-96 object-cover md:rounded-xl" :src="recipe.imageUrl" />
          <div v-else class="w-full h-96 rounded-b-xl rounded-t-none md:rounded-xl bg-stone-100 flex justify-center items-center">
            <ImagePlaceholder class="opacity-10 w-40 h-40"/>
          </div>
        </div>
        <!-- INFO -->
        <div class="md:col-span-2 pt-6 md:pt-3 md:mt-0 p-3 rounded-t-3xl md:rounded-none -mt-10 bg-white">
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
          <div class="mt-3 flex gap-x-6 justify-around md:justify-start">
            <div>
              <div>Total</div>
              <span>{{ totalTime }} min</span>
            </div>
            <div>
              <div>Prep</div>
              <span>{{ recipe.prepTime }} min</span>
            </div>
            <div>
              <div>Cook</div>
              <span>{{ recipe.cookTime }} min</span>
            </div>
            <div>
              <div>Servings</div>
              <span>{{ recipe.servings }}</span>
            </div>
          </div>
          <Button
            primary
            class="w-full md:w-40 mt-6 md:mt-3"
            @click="onCounterClick(recipe!)"
            :disabled="updateRecipeMutation.isLoading.value"
          >
            <EmptyStarIcon v-if="!isCounterClicked" class="w-6 h-6 mr-1 opacity-60" />
            <FullStarIcon v-else class="w-6 h-6 mr-2 opacity-60" />
            I made it!
            ({{ recipe.cookedCount }})
          </Button>
        </div>
        <!-- INGREDIENTS -->
        <div class="md:my-0 w-full p-3">
          <div class="text-xl uppercase font-k2d mb-1">Ingredients</div>
          <MarkdownRenderer :content="recipe.ingredients" />
          <!-- <Button class="w-full mt-4">Add to shopping list</Button> -->
        </div>
        <!-- STEPS & NOTES -->
        <div class="md:col-span-2 md:my-0 p-3">
          <div class="text-xl uppercase font-k2d mb-1">Steps</div>
          <MarkdownRenderer :content="recipe.steps" />
          <div v-if="recipe.notes">
            <div class="text-xl uppercase font-k2d mb-1 mt-6">Notes</div>
            <MarkdownRenderer :content="recipe.notes" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
