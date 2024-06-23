<script setup lang="ts">
import { ref, reactive, type Ref, watch, onMounted } from 'vue';
import { forEach, find } from 'lodash';
import { useRouter } from 'vue-router';
import { useThrottleFn } from '@vueuse/core';
import { getRecipe, useCreateRecipeMutation, useUpdateRecipeMutation } from '@/stores/recipes';
import type { Recipe, Tag } from '@/types';
import uploadImage from '@/stores/imageUpload';
import DOMPurify from 'dompurify';
import Button from '@/components/Button.vue';
import ValidationMessage from '@/components/ValidationMessage.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingState from '@/components/LoadingState.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import ImageUploader from '@/components/ImageUploader.vue';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import BackIcon from '@/assets/icons/angle-left-b.svg?component';

type RecipeMDInputKeys = 'ingredients' | 'steps' | 'notes';
type ValidationKeys = 'title' | 'category' | 'servings' | 'ingredients' | 'steps';

const createRecipeMutation = useCreateRecipeMutation();
const updateRecipeMutation = useUpdateRecipeMutation();

const props = defineProps<{
  id: string
}>();

const scrollPosition = ref(0);
const router = useRouter();
const inputValidations = reactive({
  title: { hasError: false, message: 'Enter the title of your recipe.'},
  category: { hasError: false, message: 'Choose a category.'},
  servings: { hasError: false, message: 'Enter the servings (e.g. 12 pieces or 4 servings).'},
  ingredients: { hasError: false, message: 'Add at least one ingredient.'},
  steps: { hasError: false, message: 'Add at least one step.'},
});
const categories = ['breakfast', 'soup', 'main dish', 'side dish', 'pasta', 'bread', 'sauce',
  'snack', 'dessert'];
const tags = ref('');
const saveInProgress = ref(false);
const anyInputHasError = ref(false);
const shouldUploadImage = ref(false);
const imageSourceToUpload = ref('');
const savingIsError = ref(false);
const savingErrorMessage = ref('');

// -----------------------------------
// INIT
// -----------------------------------

const id = props.id;
const { isLoading, isError: fetchingIsError, data, error: fetchingError } = getRecipe(id);
const recipe:Ref<Recipe|undefined> = ref(undefined);

// copy recipe data to be able to mutate it's properties
watch(
  data, (data) => {
    if (data) {
      recipe.value = JSON.parse(JSON.stringify(data));
      if (data.tags) {
        tags.value = data.tags.map(tag => tag.name).join(', ');
      }
    }
  },
  { immediate:true }
)

// -----------------------------------
// METHODS
// -----------------------------------

async function onSaveClick() {
  if (!recipe.value) {
    return;
  }
  validateAll();
  if (anyInputHasError.value) {
    return;
  }
  saveInProgress.value = true;
  recipe.value.tags = transformTags(tags.value, recipe.value.tags);

  // upload image to cloudinary and set image props
  if (shouldUploadImage.value === true) {
    if (imageSourceToUpload.value) {
      try {
        const uploadedImageResult = await uploadImage(imageSourceToUpload.value);
        recipe.value.imageName = uploadedImageResult.imageName;
        recipe.value.imagePublicId = uploadedImageResult.imagePublicId;
      } catch (error) {
        saveInProgress.value = false;
        savingIsError.value = true;
        savingErrorMessage.value = error as string;
      }
    } else {
      recipe.value.imagePublicId = '';
      recipe.value.imageName = '';
    }
  }

  // save recipe
  if (!savingIsError.value) {
    try {
      let response:Recipe;
      if (props.id === 'new') {
        response = await createRecipeMutation.mutateAsync(recipe.value);
      } else {
        response = await updateRecipeMutation.mutateAsync(recipe.value);
      }
      if (response.id) {
        saveInProgress.value = false;
        router.push(`/recipe/${response.id}`);
      }
    } catch (error) {
      saveInProgress.value = false;
      savingIsError.value = true;
      savingErrorMessage.value = error as string;
    }
  }
}

function onCancelClick() {
  if (window.history.state.back) {
    router.back(); // be able to go back to recipe page
  } else {
    router.push('/');
  }
}

function onInputChange(key:RecipeMDInputKeys, value:string) {
  if (recipe.value) {
    recipe.value[key] = DOMPurify.sanitize(value);
  }
}

function onCategoryChange(value: string) {
  if (recipe.value) {
    recipe.value.category = value;
  }
}

function transformTags(inputTags:string, recipeTags:Array<Tag> | undefined):Tag[] {
  if (inputTags === '') {
    return [];
  }
  const newTags = inputTags.split(',').map(tag => { return { name: tag.trim() }});
  if (!recipeTags) {
    return newTags;
  }
  newTags.forEach(newTag => {
    if (!find(recipeTags, { name: newTag.name})) {
      recipeTags.push({
        name: newTag.name
      });
    }
  });
  return recipeTags;
}

function validateAll() {
  if (recipe.value) {
    anyInputHasError.value = false;
    forEach(inputValidations, (value, key, list) => {
      value.hasError = !recipe.value![key as ValidationKeys];
      anyInputHasError.value = anyInputHasError.value || value.hasError;
    });
  }
}

function validate(key:ValidationKeys, value:string) {
  inputValidations[key].hasError = !value;
}

function onImageChange(imageSource:string) {
  shouldUploadImage.value = true;
  if (imageSource) {
    imageSourceToUpload.value = imageSource;
  } else {
    imageSourceToUpload.value = '';
    recipe.value!.imagePublicId = '';
  }
}

const updateScroll = useThrottleFn(() => {
  scrollPosition.value = window.scrollY;
}, 100, true);

onMounted(() => {
  window.addEventListener('scroll', updateScroll);
});

</script>

<template>
  <main class="max-w-screen-lg mx-auto mb-6 md:mb-20 md:mt-14">
    <LoadingState v-if="isLoading" />
    <ErrorState v-if="fetchingIsError" :error="fetchingError" />
    <div v-else-if="!isLoading && recipe">
      <!-- MOBILE -->
      <div
        class="fixed w-full z-20 top-0 left-0 md:hidden transition-colors duration-200"
        :class="{ 'bg-white border-b border-stone-200 shadow-sm': scrollPosition > 100 }"
        >
        <div
          class="flex items-center p-3"
          :class="{ 'justify-between': props.id === 'new', 'justify-end': props.id !== 'new' }"
        >
          <Button v-if="props.id === 'new'" type="white" to="/">
            <BackIcon class="w-6 h-6" />
          </Button>
          <div class="flex items-center">
            <Button
              type="white"
              :disabled="saveInProgress"
              @click="onSaveClick()"
            >
              <SpinnerIcon v-if="saveInProgress" class="w-6 h-6 animate-spin mr-1"/>
              {{ $t('saveChanges') }}
            </Button>
            <Button
              v-if="props.id !== 'new'"
              class="ml-6"
              type="white"
              :disabled="saveInProgress"
              @click="onCancelClick()"
            >
              {{ $t('cancel') }}
            </Button>
          </div>
        </div>
      </div>
      <!-- DESKTOP -->
      <div class="hidden md:block">
        <div
          class="flex items-center p-3 pt-6"
          :class="{ 'justify-between': props.id === 'new', 'justify-end': props.id !== 'new' }"
        >
          <Button v-if="props.id === 'new'" to="/">
            {{ $t('back') }}
          </Button>
          <div class="flex items-center">
            <Button
              type="primary"
              :disabled="saveInProgress"
              @click="onSaveClick()"
            >
              <SpinnerIcon v-if="saveInProgress" class="w-6 h-6 animate-spin mr-1"/>
              {{ $t('saveChanges') }}
            </Button>
            <Button
              v-if="props.id !== 'new'"
              class="ml-3"
              @click="onCancelClick()"
              :disabled="saveInProgress"
            >
              {{ $t('cancel') }}
            </Button>
          </div>
        </div>
      </div>
      <ErrorState v-if="savingIsError" :error="savingErrorMessage" />
      <section
        class="md:grid md:grid-cols-3 md:justify-items-start flex flex-col"
        aria-label="Recipe details"
      >
        <!-- IMAGE -->
        <ImageUploader :image-public-id="recipe.imagePublicId" @change="onImageChange"/>
        <!-- INFO -->
        <div class="md:col-span-2 pt-6 md:pt-3 md:mt-0 p-3 rounded-t-3xl md:rounded-none -mt-10
          bg-white drop-shadow-[0_-1px_3px_rgba(28,23,25,0.1)] md:drop-shadow-none">
          <div>
            <label for="recipeName" class="uppercase">{{ $t('recipeDetails.recipeName') }}*</label>
            <input
              type="text"
              name="recipeName"
              id="recipeName"
              aria-required="true"
              v-model="recipe.title"
              :placeholder="$t('recipeDetails.titlePlaceholder')"
              @change="validate('title', recipe!.title)"
            />
          </div>
          <ValidationMessage v-if="inputValidations.title.hasError">
            {{ inputValidations.title.message }}
          </ValidationMessage>
          <!-- TAGS -->
          <div class="mt-3">
            <label class="uppercase" for="tags">{{ $t('recipeDetails.tags') }}</label>
            <input
              type="text"
              name="tags"
              id="tags"
              v-model="tags"
              :placeholder="$t('recipeDetails.tagsPlaceholder')"
            />
          </div>
          <!-- TIME & SERVINGS -->
          <div class="mt-3 flex items-center gap-3">
            <div>
              <label for="servings" class="uppercase">{{ $t('recipeDetails.serving') }}*</label>
              <input
                type="text"
                name="servings"
                id="servings"
                aria-required="true"
                v-model="recipe.servings"
                :placeholder="$t('recipeDetails.servingsPlaceholder')"
                @change="validate('servings', recipe!.servings)"
              />
            </div>
            <div>
              <label for="prepTime" class="uppercase">{{ $t('recipeDetails.prepTime') }}</label>
              <input
                type="number"
                name="prepTime"
                id="prepTime"
                min="0"
                v-model="recipe.prepTime"
              />
            </div>
            <div>
              <label for="cookTime" class="uppercase">{{ $t('recipeDetails.cookTime') }}</label>
              <input
                type="number"
                name="cookTime"
                id="cookTime"
                min="0"
                v-model="recipe.cookTime"
              />
            </div>
          </div>
          <ValidationMessage v-if="inputValidations.servings.hasError">
            {{ inputValidations.servings.message }}
          </ValidationMessage>
          <div class="mt-6">
            <span class="uppercase">{{ $t('recipeDetails.dishType') }}*</span>
            <section
              class="flex items-center flex-wrap gap-3"
              aria-label="select a main category for the recipe"
            >
              <button
                class="border border-stone-300 uppercase px-3 py-2 md:py-1.5 rounded-lg
                  cursor-pointer hover:border-sky-300 hover:transition-colors"
                :class="{
                  'bg-sky-300 text-white border-sky-300 hover:text-white': recipe.category === category,
                  'hover:text-sky-400': recipe.category !== category
                }"
                v-for="category in categories"
                @click="onCategoryChange(category)"
              >
                {{ category }}
              </button>
            </section>
          </div>
          <ValidationMessage v-if="inputValidations.category.hasError">
            {{ inputValidations.category.message }}
          </ValidationMessage>
        </div>
        <!-- INGREDIENTS -->
        <div class="md:my-0 w-full p-3">
          <div class="flex">
            <label for="ingredients" class="text-xl uppercase font-k2d mb-1">
              {{ $t('recipeDetails.ingredients') }}<sup>*</sup>
            </label>
          </div>
          <div class="h-48 md:h-64">
            <MarkdownEditor
              :content="recipe.ingredients"
              :placeholder="$t('recipeDetails.ingredientsPlaceholder')"
              @change="(event) => { onInputChange('ingredients', event); validate('ingredients', event) }"
            />
          </div>
          <ValidationMessage v-if="inputValidations.ingredients.hasError">
            {{ inputValidations.ingredients.message }}
          </ValidationMessage>
        </div>
        <!-- STEPS & NOTES -->
        <div class="md:col-span-2 md:my-0 w-full p-3">
          <div class="flex">
            <label for="steps" class="text-xl uppercase font-k2d mb-1">
              {{ $t('recipeDetails.steps') }}<sup>*</sup>
            </label>
          </div>
          <div class="h-48 md:h-64">
            <MarkdownEditor
              :content="recipe.steps"
              :placeholder="$t('recipeDetails.stepsPlaceholder')"
              @change="(event) => { onInputChange('steps', event); validate('steps', event) }"
            />
          </div>
          
          <ValidationMessage v-if="inputValidations.steps.hasError">
            {{ inputValidations.steps.message }}
          </ValidationMessage>
          <div class="mt-3">
            <label for="notes" class="text-xl uppercase font-k2d mb-1 inline-block">
              {{ $t('recipeDetails.notes') }}
            </label>
            <div class="h-auto">
              <MarkdownEditor
                :content="recipe.notes"
                :placeholder="$t('recipeDetails.notesPlaceholder')"
                @change="(event) => onInputChange('notes', event)"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
