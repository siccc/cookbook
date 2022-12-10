<script setup lang="ts">
import { getRecipe, useCreateRecipeMutation, useUpdateRecipeMutation } from '@/stores/recipes';
import type { Recipe, Tag } from '@/types';
import DOMPurify from 'dompurify';
import { uploadImage } from '@/stores/cloudinary';
// import { isMobile } from '@/stores/utility';
import Button from '@/components/Button.vue';
import ValidationMessage from '@/components/ValidationMessage.vue';
import CategoryButton from '@/components/CategoryButton.vue';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import ImageUploader from '@/components/ImageUploader.vue';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import ErrorIcon from '@/assets/error.svg?component';
import LoadingIcon from '@/assets/loading-pot.svg?component';
import LoadingShadow from '@/assets/loading-shadow.svg?component';
import { ref, reactive, type Ref, watch } from 'vue';
import { forEach, find } from 'lodash';
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
const categories = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'side dish'];
const tags = ref('');
const saveInProgress = ref(false);
const anyInputHasError = ref(false);
const shouldSaveImage = ref(false);
const savingIsError = ref(false);
const savingErrorMessage = ref('');

// const useMobile = isMobile();
// const mdEditorSizes = {
//   'ingredients': useMobile ? 200 : 400,
//   'steps': useMobile ? 200 : 300,
//   'notes': 100
// }

// -----------------------------------
// INIT
// -----------------------------------

const id = props.id === 'new' ? props.id : Number(props.id);
const { isLoading, isError, data, error } = getRecipe(id);
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
  if (shouldSaveImage.value === true) {
    if (recipe.value.imageUrl) {
      try {
        const uploadedImageResult = await uploadImage(recipe.value.imageUrl);
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
      recipe.value.imageUrl = '';
    }
  }

  // save recipe
  if (!savingIsError.value) {
    console.log('tags: ', recipe.value.tags)
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
  router.back();
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
  if (recipe.value) {
    shouldSaveImage.value = true;
    recipe.value.imageUrl = imageSource;
  }
}

</script>

<template>
  <div class="p-4 max-w-screen-lg mx-auto">
    <div v-if="isLoading" class="my-8 text-center font-k2d text-2xl text-yellow-400 flex
      flex-col justify-center items-center">
        <LoadingIcon class="w-24 opacity-80 animate-bounce block" />
        <LoadingShadow class="w-24 opacity-80 block" />
      Loading...
    </div>
    <div v-if="isError" class="my-8 text-center font-k2d text-xl text-red-300 flex
      justify-center items-center">
      <ErrorIcon class="w-24 h-24 opacity-50" />
      <div>{{ error }}</div>
    </div>
    <div v-else-if="!isLoading && recipe">
      <div class="flex justify-between items-center mb-8">
        <Button class="uppercase" to="/">
          Back
        </Button>
        <div class="flex items-center">
          <Button
            class="uppercase"
            primary
            @click="onSaveClick()"
            :disabled="saveInProgress"
          >
            <SpinnerIcon v-if="saveInProgress" class="w-6 h-6 animate-spin mr-1"/>
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
      <div v-if="savingIsError" class="my-8 text-center font-k2d text-xl text-red-300 flex
        justify-center items-center">
        <ErrorIcon class="w-24 h-24 opacity-50" />
        <div>{{ savingErrorMessage }}</div>
      </div>
      <div class="md:grid md:grid-cols-3 md:gap-6 md:justify-items-start">
        <ImageUploader :image-source="recipe.imageUrl" @change="onImageChange"/>
        <div class="md:col-span-2 my-6 md:my-0">
          <div>
            <span class="uppercase">Your recipe's name*</span>
            <input
              v-model="recipe.title"
              placeholder="My favorite bolognese sauce"
              @change="validate('title', recipe!.title)"
            />
          </div>
          <ValidationMessage v-if="inputValidations.title.hasError">
            {{ inputValidations.title.message }}
          </ValidationMessage>
          <div class="mt-3">
            <span class="uppercase">Tags</span>
            <input v-model="tags" placeholder="italian, comfort food"/>
          </div>
          <div class="mt-6 flex items-center gap-3">
            <div>
              <span class="uppercase">Serving*</span>
              <input
                v-model="recipe.servings"
                placeholder="4 servings"
                @change="validate('servings', recipe!.servings)"
              />
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
          <ValidationMessage v-if="inputValidations.servings.hasError">
            {{ inputValidations.servings.message }}
          </ValidationMessage>
          <div class="mt-6">
            <span class="uppercase">Dish type*</span>
            <div class="flex items-center flex-wrap gap-3">
              <CategoryButton
                :class="{
                  'bg-sky-300 border-sky-300 text-white hover:border-sky-300 hover:text-white': recipe.category === category
                }"
                v-for="category in categories"
                @click="onCategoryChange(category)"
              >
                {{ category }}
              </CategoryButton>
            </div>
          </div>
          <ValidationMessage v-if="inputValidations.category.hasError">
            {{ inputValidations.category.message }}
          </ValidationMessage>
        </div>
        <div class="my-6 md:my-0 w-full">
          <div class="flex">
            <div class="text-xl uppercase font-k2d mb-1">Ingredients</div><span>*</span>
          </div>
          <div class="h-auto md:h-64">
            <MarkdownEditor
              :content="recipe.ingredients"
              placeholder="- ingredient 1 
- ingredient 2
- ..."
              @change="(event) => { onInputChange('ingredients', event); validate('ingredients', event) }"
            />
          </div>
          <ValidationMessage v-if="inputValidations.ingredients.hasError">
            {{ inputValidations.ingredients.message }}
          </ValidationMessage>
        </div>
        <div class="md:col-span-2 my-6 md:my-0 w-full">
          <div class="flex">
            <div class="text-xl uppercase font-k2d mb-1">Steps</div><span>*</span>
          </div>
          <div class="h-auto md:h-64">
            <MarkdownEditor
              :content="recipe.steps"
              placeholder="1. first step 
2. second step
3. ..."
              @change="(event) => { onInputChange('steps', event); validate('steps', event) }"
            />
          </div>
          
          <ValidationMessage v-if="inputValidations.steps.hasError">
            {{ inputValidations.steps.message }}
          </ValidationMessage>
          <div class="text-xl uppercase font-k2d mb-1 mt-3">Notes</div>
          <div class="h-auto">
            <MarkdownEditor
              :content="recipe.notes"
              placeholder="Add your notes"
              @change="(event) => onInputChange('notes', event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
