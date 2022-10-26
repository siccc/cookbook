<script setup lang="ts">
import { getRecipe, useDeleteRecipeMutation, useUpdateRecipeMutation } from '@/stores/recipes';
import type { Recipe } from '@/types';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';
import Button from '@/components/Button.vue';
import StarIcon from '@/assets/icons/star.svg?component';
import DeleteIcon from '@/assets/icons/trash-alt.svg?component';
import EditIcon from '@/assets/icons/edit.svg?component';
import router from '@/router';

const props = defineProps<{
  id: number
}>();

const { isLoading, isError, isFetching, data, error, refetch } = getRecipe(props.id);
const deleteRecipeMutation = useDeleteRecipeMutation();
const updateRecipeMutation = useUpdateRecipeMutation();

function onDelete(recipe: Recipe) {
  deleteRecipeMutation.mutate(recipe);
  router.push('/');
}

function onCounterClick(recipe: Recipe) {
  const newRecipe = { ...recipe };
  newRecipe.cookedCount = newRecipe.cookedCount + 1;
  updateRecipeMutation.mutate(newRecipe);
}
</script>

<template>
  <div class="p-4 max-w-screen-md mx-auto">
    <div v-if="isLoading" class="my-8 text-center font-k2d text-2xl text-yellow-400">
      Loading...
    </div>
    <div v-if="isError" class="my-8 text-center font-k2d text-xl text-red-300">
      {{ error }}
    </div>
    <div v-else-if="!isLoading && data">
      <!-- NAV & OPTIONS -->
      <div class="flex justify-between items-center mb-8">
        <Button class="uppercase" to="/">
          Go back
        </Button>
        <div class="flex items-center">
          <Button class="mr-3">
            <EditIcon class="w-5 h-5 mr-2" />
            Edit
          </Button>
          <Button @click="onDelete(data!)">
            <DeleteIcon class="w-5 h-5 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      <div class="grid md:grid-cols-3 gap-6 md:gap-x-16 md:gap-y-6 justify-items-center md:justify-items-start">
        <!-- IMAGE -->
        <div class="col-span-1">
          <div class="h-72 w-60 bg-slate-100"></div>
        </div>
        <!-- INFO -->
        <div class="md:col-span-2">
          <div class="uppercase font-k2d text-xl border-b-4 border-yellow-400 inline-block">
            {{ data.title }}
          </div>
          <!-- TODO: TAGS -->
          <div class="my-4">
            <span class="text-sky-300 inline-block bg-sky-100 rounded-sm px-1 py-0.5">
              {{ data.category }}
            </span>
            <!-- <div>{{ data?.tags }}</div> -->
          </div>
          <div class="flex gap-x-6">
            <div>
              <div>Total</div>
              <span>{{ data.totalTime }} min</span>
            </div>
            <div>
              <div>Prep</div>
              <span>{{ data.prepTime }} min</span>
            </div>
            <div>
              <div>Cook</div>
              <span>{{ data.cookTime }} min</span>
            </div>
            <div>
              <div>Servings</div>
              <span>{{ data.servings }}</span>
            </div>
          </div>
          <Button
            primary
            class="w-full md:w-40 mt-4"
            @click="onCounterClick(data!)"
            :disabled="updateRecipeMutation.isLoading.value"
          >
            <StarIcon class="w-5 h-5 mr-2" />
            I made it!
            ({{ data.cookedCount }})
          </Button>
        </div>
        <!-- INGREDIENTS -->
        <div class="justify-self-start">
          <div class="text-xl uppercase font-k2d mb-1">Ingredients</div>
          <MarkdownRenderer :content="data.ingredients" />
          <!-- <div class="btn w-full mt-4">Add to groceries</div> -->
          <Button class="w-full mt-4">Add to groceries</Button>
        </div>
        <!-- STEPS & NOTES -->
        <div class="md:col-span-2">
          <div class="text-xl uppercase font-k2d mb-1">Steps</div>
          <MarkdownRenderer :content="data.steps" />
          <div v-if="data.notes">
            <div class="text-xl uppercase font-k2d mb-1 mt-3">Notes</div>
            {{ data.notes }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
