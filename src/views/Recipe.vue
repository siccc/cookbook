<script setup lang="ts">
import { getRecipe } from '../stores/recipes';
const props = defineProps<{
  id: string
}>();
const { isLoading, isError, isFetching, data, error, refetch } = getRecipe(props.id);

</script>

<template>
  <div class="p-4 max-w-screen-md mx-auto">
    <RouterLink to="/" class="p-2 font-k2d uppercase mb-8 block cursor-pointer">Go back</RouterLink>
    <div v-if="isLoading" class="mt-8">Loading...</div>
    <div v-else-if="!isLoading && data"
      class="grid md:grid-cols-3 gap-6 md:gap-x-16 md:gap-y-6 justify-items-center md:justify-items-start">
      <!-- IMAGE -->
      <div class="col-span-1">
        <div class="h-72 w-60 bg-slate-100"></div>
      </div>
      <!-- INFO -->
      <div class="md:col-span-2">
        <div class="uppercase font-k2d text-xl px-2 py-1 bg-yellow-400 inline-block">{{ data.title }}</div>
        <!-- TODO: TAGS -->
        <div class="my-4">
          <span class="border-2 border-yellow-400 rounded-lg px-2 py-1">{{ data.category }}</span>
          <!-- <div>{{ data?.tags }}</div> -->
        </div>
        <div class="flex gap-x-6">
          <!-- <div>
            <div>Total</div>
            <span>{{ data.totalTime }} min</span>
          </div> -->
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
        <div class="px-3 py-1.5 bg-yellow-400 text-center md:inline-block rounded-lg uppercase mt-4 cursor-pointer">I
          did
          it</div>
      </div>
      <!-- INGREDIENTS -->
      <div>
        <div class="text-xl uppercase font-k2d mb-2">Ingredients</div>
        {{ data.ingredients }}
      </div>
      <!-- STEPS & NOTES -->
      <div class="md:col-span-2">
        <div class="text-xl uppercase font-k2d mb-2">Steps</div>
        {{ data.steps }}
        <div v-if="data.notes">
          <div class="text-xl uppercase font-k2d mb-2">Notes</div>
          {{ data.notes }}
        </div>
      </div>
    </div>
  </div>
</template>
