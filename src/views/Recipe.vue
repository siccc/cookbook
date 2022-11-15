<script setup lang="ts">
import { getRecipe, useDeleteRecipeMutation, useUpdateRecipeMutation } from '@/stores/recipes';
import type { Recipe } from '@/types';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';
import Button from '@/components/Button.vue';
import EmptyStarIcon from '@/assets/icons/star.svg?component';
import FullStarIcon from '@/assets/icons/full-star.svg?component';
import DeleteIcon from '@/assets/icons/trash-alt.svg?component';
import EditIcon from '@/assets/icons/edit.svg?component';
import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
import ErrorIcon from '@/assets/error.svg?component';
import LoadingIcon from '@/assets/loading-pot.svg?component';
import LoadingShadow from '@/assets/loading-shadow.svg?component';
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';

const props = defineProps<{
  id: number
}>();

const router = useRouter();
const isCounterClicked = ref(false);
const { isLoading, isError, data:recipe, error } = getRecipe(props.id);
const deleteRecipeMutation = useDeleteRecipeMutation();
const updateRecipeMutation = useUpdateRecipeMutation();

const totalTime = computed<number>(() => {
  if (!recipe.value) {
    return 0;
  }
  return (recipe.value.cookTime || 0) + (recipe.value.prepTime || 0);
});

function onDelete(recipe: Recipe) {
  deleteRecipeMutation.mutate(recipe);
  router.push('/');
}

function onCounterClick(recipe: Recipe) {
  isCounterClicked.value = true;
  const newRecipe = JSON.parse(JSON.stringify(recipe));
  newRecipe.cookedCount = newRecipe.cookedCount + 1;
  updateRecipeMutation.mutate(newRecipe);
}

</script>

<template>
  <div class="p-4 max-w-screen-lg mx-auto">
    <div v-if="isLoading" class="my-8 text-center font-k2d text-2xl text-yellow-400 flex flex-col justify-center items-center">
        <LoadingIcon class="w-24 opacity-80 animate-bounce block" />
        <LoadingShadow class="w-24 opacity-80 block" />
      Loading...
    </div>
    <div v-if="isError" class="my-8 text-center font-k2d text-xl text-red-300 flex justify-center items-center">
      <ErrorIcon class="w-24 h-24 opacity-50" />
      <div>{{ error }}</div>
    </div>
    <div v-else-if="!isLoading && recipe">
      <!-- NAV & ACTIONS -->
      <div class="flex justify-between items-center mb-8">
        <Button class="uppercase" to="/">
          Back
        </Button>
        <div class="flex items-center">
          <Button class="mr-3" :to="`/edit/${props.id}`">
            <EditIcon class="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button @click="onDelete(recipe!)">
            <DeleteIcon class="w-5 h-5 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      <div class="md:grid md:grid-cols-3 md:gap-6 md:justify-items-start">
        <!-- IMAGE -->
        <div class="my-6 md:my-0 w-full">
          <img v-if="recipe.imageUrl" class="w-full h-96 object-cover rounded-xl" :src="recipe.imageUrl" />
          <div v-else class="w-full h-96 rounded-xl bg-stone-100 flex justify-center items-center">
            <ImagePlaceholder class="opacity-10 w-40 h-40"/>
          </div>
        </div>
        <!-- INFO -->
        <div class="md:col-span-2 my-6 md:my-0">
          <div class="uppercase font-k2d text-2xl text-center md:text-start">
            {{ recipe.title }}
          </div>
          <!-- TAGS -->
          <div class="mt-2 flex justify-center md:justify-start">
            <span class="tag mr-2">
              {{ recipe.category }}
            </span>
            <div class="mr-2 flex items-center" v-for="tag in recipe.tags" :key="tag.id">
              <span class="dot" />
              <span class="tag">{{ tag.name }}</span>
            </div>
          </div>
          <!-- TIME & SERVINGS -->
          <div class="mt-6 flex gap-x-6">
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
            class="w-full md:w-40 mt-4"
            @click="onCounterClick(recipe!)"
            :disabled="updateRecipeMutation.isLoading.value"
          >
            <EmptyStarIcon v-if="!isCounterClicked" class="w-5 h-5 mr-2 opacity-60" />
            <FullStarIcon v-else class="w-5 h-5 mr-2 opacity-60" />
            I made it!
            ({{ recipe.cookedCount }})
          </Button>
        </div>
        <!-- INGREDIENTS -->
        <div class="my-6 md:my-0 w-full">
          <div class="text-xl uppercase font-k2d mb-1">Ingredients</div>
          <MarkdownRenderer :content="recipe.ingredients" />
          <!-- <div class="btn w-full mt-4">Add to groceries</div> -->
          <Button class="w-full mt-4">Add to groceries</Button>
        </div>
        <!-- STEPS & NOTES -->
        <div class="md:col-span-2 my-6 md:my-0">
          <div class="text-xl uppercase font-k2d mb-1">Steps</div>
          <MarkdownRenderer :content="recipe.steps" />
          <div v-if="recipe.notes">
            <div class="text-xl uppercase font-k2d mb-1 mt-3">Notes</div>
            <MarkdownRenderer :content="recipe.notes" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag {
  @apply inline-block text-stone-400 uppercase;
}
.dot {
  @apply bg-stone-400 rounded-full w-1 h-1 mr-2 inline-block;
}
</style>