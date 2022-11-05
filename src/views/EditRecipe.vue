<script setup lang="ts">
import { getRecipe, useCreateRecipeMutation, useUpdateRecipeMutation } from '@/stores/recipes';
import type { Recipe, Tag } from '@/types';
import Button from '@/components/Button.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import ErrorIcon from '@/assets/error.svg?component';
import LoadingIcon from '@/assets/loading-pot.svg?component';
import LoadingShadow from '@/assets/loading-shadow.svg?component';
import { ref, reactive, computed, type Ref, type ComputedRef } from 'vue';
import { forEach } from 'lodash';
import { useRouter } from 'vue-router';

type RecipeMDInputKeys = 'ingredients' | 'steps' | 'notes';
type ValidationKeys = 'title' | 'category' | 'servings' | 'ingredients' | 'steps';

const createRecipeMutation = useCreateRecipeMutation();
const updateRecipeMutation = useUpdateRecipeMutation();

const props = defineProps<{
  id: string
}>();
const router = useRouter();
const inputValidations = reactive({
  title: { hasError: false, message: 'Enter the title of your recipe.'},
  category: { hasError: false, message: 'Choose a category.'},
  servings: { hasError: false, message: 'Enter the servings (e.g. 12 pieces or 4 servings).'},
  ingredients: { hasError: false, message: 'Add at least one the ingredient.'},
  steps: { hasError: false, message: 'Add at least one step.'},
});
const tags:Ref<string> = ref('');
const saveInProgress:Ref<boolean>  = ref(false);
const anyInputHasError:Ref<boolean> = ref(false);

// -----------------------------------
// INIT
// -----------------------------------

const id = props.id === 'new' ? props.id : Number(props.id);
const { isLoading, isError, data, error } = getRecipe(id);

// copy recipe data to be able to mutate it's properties
const recipe:ComputedRef<Recipe> = computed(() => {
  if (data.value) {
    return reactive(JSON.parse(JSON.stringify(data.value)));
  }
  return;
});

// -----------------------------------
// METHODS
// -----------------------------------

async function onSaveClick() {
  // validation
  validateAll();
  if (anyInputHasError.value) {
    return;
  }
  
  // transform tags
  if (tags.value) {
    recipe.value.tags = transformTags(tags.value);
  }

  // save recipe
  saveInProgress.value = true;
  let response:Recipe;
  if (props.id === 'new') {
    response = await createRecipeMutation.mutateAsync(recipe.value);
  } else {
    response = await updateRecipeMutation.mutateAsync(recipe.value);
  }
  // TODO: error handling
  if (response.id) {
    saveInProgress.value = false;
    router.push(`/recipe/${response.id}`);
  }
}

function onCancelClick() {
  router.back();
}

function onInputChange(key:RecipeMDInputKeys, value:string) {
  recipe.value[key] = value;
}

function onCategoryChange(value: string) {
  recipe.value.category = value;
}

function transformTags(tags:string):Tag[] {
  return tags.split(',').map(tag => {
    return {
      name: tag.trim()
    }
  });
}

function validateAll() {
  anyInputHasError.value = false;
  forEach(inputValidations, (value, key, list) => {
    value.hasError = !recipe.value[key as ValidationKeys];
    anyInputHasError.value = anyInputHasError.value || value.hasError;
  });
}

function validate(key:ValidationKeys, value:string) {
  inputValidations[key].hasError = !value;
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
    <div v-else-if="!isLoading && data">
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
          <Button
            v-if="props.id !== 'new'"
            class="uppercase ml-3"
            @click="onCancelClick()"
            :disabled="saveInProgress"
          >
            Cancel
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
            <span class="uppercase">Your recipe's name*</span>
            <input v-model="recipe.title" placeholder="My favorite bolognese sauce" @change="validate('title', recipe.title)"/>
          </div>
          <div v-if="inputValidations.title.hasError" class="validationError">
            {{ inputValidations.title.message }}
          </div>
          <div class="mt-3">
            <span class="uppercase">Tags</span>
            <input v-model="tags" placeholder="italian, comfort food"/>
          </div>
          <div class="mt-6 flex items-center gap-3">
            <div>
              <span class="uppercase">Serving*</span>
              <input v-model="recipe.servings" placeholder="4 servings" @change="validate('servings', recipe.servings)"/>
            </div>
            <div>
              <span class="uppercase">Prep time</span>
              <input type="number" min="0" v-model="recipe.prepTime" />
            </div>
            <div>
              <span class="uppercase">Cook time</span>
              <input type="number" min="0" v-model="recipe.cookTime" />
            </div>
          </div>
          <div v-if="inputValidations.servings.hasError" class="validationError">
            {{ inputValidations.servings.message }}
          </div>
          <div class="mt-6">
            <span class="uppercase">Dish type*</span>
            <div class="flex items-center flex-wrap gap-3">
              <div
                class="category"
                :class="{'selected-category': recipe.category === category}"
                v-for="category in ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']"
                @click="onCategoryChange(category)"
              >
                {{ category }}
              </div>
            </div>
          </div>
          <div v-if="inputValidations.category.hasError" class="validationError">
            {{ inputValidations.category.message }}
          </div>
        </div>
        <div class="my-6 md:my-0 w-full">
          <div class="flex">
            <div class="text-xl uppercase font-k2d mb-1">Ingredients</div><span>*</span>
          </div>
          <MarkdownEditor
            :content="recipe.ingredients"
            :height="400"
            placeholder="Add some ingredients"
            @change="(event) => { onInputChange('ingredients', event); validate('steps', event) }"
          />
          <div v-if="inputValidations.ingredients.hasError" class="validationError">
            {{ inputValidations.ingredients.message }}
          </div>
        </div>
        <div class="md:col-span-2 my-6 md:my-0 w-full">
          <div class="flex">
            <div class="text-xl uppercase font-k2d mb-1">Steps</div><span>*</span>
          </div>
          <MarkdownEditor
            :content="recipe.steps"
            :height="300"
            placeholder="Add steps"
            @change="(event) => { onInputChange('steps', event); validate('steps', event) }"
          />
          <div v-if="inputValidations.steps.hasError" class="validationError">
            {{ inputValidations.steps.message }}
          </div>
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

.validationError {
  @apply px-3 py-1.5 w-full rounded border border-solid border-red-300 text-red-400 mt-1;
}
</style>