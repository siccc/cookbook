<script setup lang="ts">
import { useCreateRecipeMutation } from '@/stores/recipes';
import type { Recipe, Tag } from '@/types';
import Button from '@/components/Button.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import { ref, reactive, type Ref } from 'vue';
import router from '@/router';

const createRecipeMutation = useCreateRecipeMutation();

const props = defineProps<{
  id: number | 'new'
}>();
const recipe:Recipe = reactive({
  title: '',
  id: 0,
  category: '',
  cookTime: 0,
  prepTime: 0,
  servings: '',
  cookedCount: 0,
  ingredients: '',
  steps: '',
  notes: ''
});
const tags:Ref<string> = ref('');
const saveInProgress = ref(false);

type MDInputPropNames = 'ingredients' | 'steps' | 'notes';

async function onSaveClick() {
  saveInProgress.value = true;
  if (tags.value) {
    recipe.tags = transformTags(tags.value);
  }
  const response = await createRecipeMutation.mutateAsync(recipe);
  saveInProgress.value = false;
  // TODO: error handling
  if (response.id) {
    router.push(`/recipe/${response.id}`);
  }
}

function onInputChange(key:MDInputPropNames, value:string) {
  console.log('onInputChange', value);
  if (key in recipe) {
    recipe[key] = value;
  }
}

function setCategory(value: string) {
  recipe.category = value;
}

function transformTags(tags:string):Tag[] {
  return tags.split(',').map(tag => {
    return {
      name: tag.trim()
    }
  });
}

</script>

<template>
  <div class="p-4 max-w-screen-lg mx-auto">
    <div class="flex justify-between items-center mb-8">
      <Button class="uppercase" to="/">
        Go back
      </Button>
      <div class="flex items-center">
        <Button
          class="uppercase"
          primary
          @click="onSaveClick()"
          :disabled="saveInProgress"
        >
          <SpinnerIcon v-if="saveInProgress" class="w-8 h-8 animate-spin mr-2"/>
          Save
        </Button>
      </div>
    </div>
    <div class="md:grid md:grid-cols-3 md:gap-6 md:justify-items-start">
      <div class="w-full h-96 rounded-xl bg-stone-50 border-dashed border-2 border-stone-300 flex flex-col justify-center items-center">
        <ImagePlaceholder class="opacity-10 w-40 h-40"/>
        <span class="text-stone-400"><span class="text-yellow-400 font-semibold cursor-pointer">Upload</span> a photo of your dish</span>
      </div>
      <div class="md:col-span-2 my-6 md:my-0">
        <div>
          <span class="uppercase">Your recipe's name</span>
          <input class="" v-model="recipe.title" placeholder="My favorite bolognese sauce"/>
        </div>
        <div class="mt-3">
          <span class="uppercase">Tags</span>
          <input class="" v-model="tags" placeholder="italian, comfort food"/>
        </div>
        <div class="mt-6 flex items-center gap-3">
          <div>
            <span class="uppercase">Serving</span>
            <input class="" v-model="recipe.servings" placeholder="4 servings"/>
          </div>
          <div>
            <span class="uppercase">Prep time</span>
            <input type="number" v-model="recipe.prepTime" />
          </div>
          <div>
            <span class="uppercase">Cook time</span>
            <input type="number" v-model="recipe.cookTime" />
          </div>
        </div>
        <div class="mt-6">
          <span class="uppercase">Dish type</span>
          <div class="flex items-center flex-wrap gap-3">
            <div
              class="category"
              :class="{'selected-category': recipe.category === category}"
              v-for="category in ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']"
              @click="setCategory(category)"
            >
              {{ category }}
            </div>
          </div>
        </div>
      </div>
      <div class="my-6 md:my-0 w-full">
        <div class="text-xl uppercase font-k2d mb-1">Ingredients</div>
        <MarkdownEditor
          :content="recipe.ingredients"
          :height="400"
          placeholder="Add some ingredients"
          @change="(event) => onInputChange('ingredients', event)"
        />
      </div>
      <div class="md:col-span-2 my-6 md:my-0 w-full">
        <div class="text-xl uppercase font-k2d mb-1">Steps</div>
        <MarkdownEditor
          :content="recipe.steps"
          :height="300"
          placeholder="Add steps"
          @change="(event) => onInputChange('steps', event)"
        />
        <div class="text-xl uppercase font-k2d mb-1 mt-3">Notes</div>
        <MarkdownEditor
          :content="recipe.notes"
          :height="100"
          placeholder="Add your notes"
          @change="(event) => onInputChange('notes', event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.category {
  @apply border border-stone-300 uppercase px-3 py-1.5 rounded cursor-pointer;
}
.category:hover:not(.selected-category) {
  @apply border-sky-300 text-sky-400;
}
.selected-category {
  @apply bg-sky-300 border-sky-300 text-white;
}
input, textarea {
  @apply px-3 py-1.5 w-full rounded border border-solid border-stone-300
  focus:text-stone-800 focus:bg-white focus:border-yellow-400 focus:outline-none;
}
</style>