<script setup lang="ts">
import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
import DeleteIcon from '@/assets/icons/trash-alt.svg?component';
import Button from '@/components/Button.vue';
import ImageUploadIcon from '@/assets/icons/image-upload.svg?component';
import { ref, type Ref } from 'vue';

const props = defineProps<{
  imageSource?: string
}>();

const emit = defineEmits<{
  (e: 'change', content: string): void
}>();

const imageSource:Ref<string> = ref(props.imageSource || '');
const fileInput:Ref<HTMLInputElement | null> = ref(null);
const hasFileSizeError:Ref<Boolean> = ref(false);
const fileSizeErrorMessage:string = `Maximum allowed file size is 50 MB.`

async function onFileSelect(event:Event) {
  const target= event.target as HTMLInputElement;
  const file: File = (target.files as FileList)[0];
  if (!file) return;
  
  validateFileSize(file.size);

  const readData = (f:File) =>  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      imageSource.value = reader.result as string;
    };
    reader.onloadend = () => {
      if(fileInput && fileInput.value) {
        fileInput.value.value = '';
      }
      resolve(reader.result as string);
    };
    reader.readAsDataURL(f);
  });

  await readData(file);
  emit('change', imageSource.value);
}

function deleteImageUrl() {
  imageSource.value = '';
  emit('change', imageSource.value);
}

function validateFileSize(size:number) {
  // maximum allowed size 50 MB
  if (size > 50 * 1024 * 1024) {
    hasFileSizeError.value = true;
  }
}
</script>

<template>
  <div class="w-full md:p-3">
    <input
      type="file"
      accept=".jpeg,.jpg,.png,image/jpeg,image/png"
      @change="onFileSelect"
      id="uploadImage"
      hidden
      :for="fileInput"
    />
    <!-- PLACEHOLDER IMAGE -->
    <div
      v-if="!imageSource"
      class="w-full h-96 md:rounded-xl bg-stone-200 md:bg-stone-50 md:border-dashed md:border-2
        border-stone-300 flex flex-col justify-center items-center"
    >
      <ImagePlaceholder class="opacity-10 w-40 h-40"/>
      <label class="text-stone-400 cursor-pointer p-2 group" for="uploadImage">
        <span class="text-yellow-400 font-semibold group-hover:text-yellow-300">Upload</span>
         a photo of your dish
      </label>
    </div>
    <!-- IMAGE PREVIEW -->
    <div v-else class="w-full">
      <img class="w-full h-96 object-cover md:rounded-xl" :src="imageSource" />
      <div class="md:justify-between md:items-center md:flex hidden">
        <label class="block cursor-pointer group p-2 text-stone-400" for="uploadImage">
          <span class="text-yellow-400 font-semibold group-hover:text-yellow-300">Upload</span>
           a photo of your dish
        </label>
        <label class="text-stone-400 cursor-pointer p-2 block" @click="deleteImageUrl">
          <span class="text-red-400 font-semibold hover:text-red-300">Delete</span>
        </label>
      </div>
      <div class="flex justify-between items-center md:hidden -mt-24 mb-14 px-3">
        <label
          for="uploadImage"
          class="bg-white flex items-center shadow p-3 rounded-lg hover:bg-yellow-400 hover:text-white"
        >
          <ImageUploadIcon class="w-6 h-6" />
          Upload
        </label>
        <Button white @click="deleteImageUrl">
          <DeleteIcon class="w-6 h-6 mr-1" />
          Delete photo
        </Button>
      </div>
    </div>
    <div v-if="hasFileSizeError" class="validationError">
      {{ fileSizeErrorMessage }}
    </div>
  </div>
</template>

<style scoped>
.validationError {
  @apply px-3 py-1.5 w-full rounded border border-solid border-red-300 text-red-400 mt-1;
}
</style>