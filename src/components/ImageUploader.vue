<script setup lang="ts">
import { reactive, ref, type Ref } from 'vue';
import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
import DeleteIcon from '@/assets/icons/trash-alt.svg?component';
import Button from '@/components/Button.vue';
import ImageUploadIcon from '@/assets/icons/image-upload.svg?component';
import Image from '@/components/Image.vue';

const props = defineProps<{
  imagePublicId?: string
}>();

const emit = defineEmits<{
  (e: 'change', content: string): void
}>();

const imageSource:Ref<string> = ref('');
const fileInput:Ref<HTMLInputElement | null> = ref(null);

const imageValidations = reactive({
  fileSize: { hasError: false, message: 'Maximum allowed file size is 10 MB.'},
  fileExtension: { hasError: false, message: 'Only .jpeg, .jpg, .png or .webp files are allowed.'},
});

function clickFileInput() {
  if(fileInput && fileInput.value) {
    fileInput.value.click();
  }
}

async function onFileSelect(event:Event) {
  imageValidations.fileSize.hasError = false;
  imageValidations.fileExtension.hasError = false;
  const target= event.target as HTMLInputElement;
  const file: File = (target.files as FileList)[0];
  if (!file) return;
  
  validateFileSize(file.size);
  validateFileExtension(file.type);

  if (imageValidations.fileSize.hasError || imageValidations.fileExtension.hasError) {
    imageSource.value = '';
    return;
  }

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

function deleteImage() {
  imageSource.value = '';
  emit('change', imageSource.value);
}

function validateFileSize(size:number) {
  // maximum allowed size 10 MB
  if (size > 10 * 1024 * 1024) {
    imageValidations.fileSize.hasError = true;
  }
}

function validateFileExtension(type:string) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
    imageValidations.fileExtension.hasError = true;
  }
}

</script>

<template>
  <div class="w-full md:p-3">
    <input
      ref="fileInput"
      type="file"
      accept="image/png, image/jpeg, image/webp"
      @change="onFileSelect"
      id="uploadImage"
      hidden
    />
    <!-- PLACEHOLDER IMAGE -->
    <div
      v-if="!imageSource && !imagePublicId"
      class="w-full h-96 md:rounded-xl bg-stone-100 md:bg-stone-50 md:border-dashed md:border-2
        border-stone-300 flex flex-col justify-center items-center"
    >
      <ImagePlaceholder class="opacity-10 w-40 h-40" aria-hidden="true"/>
      <label
        class="text-stone-400 cursor-pointer p-2 group"
        for="uploadImage"
        role="button"
        tabindex="0"
        @keydown.enter="clickFileInput"
        @keydown.space="clickFileInput"
      >
        <span class="text-yellow-400 font-semibold group-hover:text-yellow-300">
          Upload
        </span>
         a photo of your dish
      </label>
    </div>
    <!-- IMAGE PREVIEW -->
    <div v-else class="w-full">
      <img
        v-if="!imagePublicId || imageSource"
        class="w-full h-96 object-cover md:rounded-xl"
        :src="imageSource"
        alt="preview of the uploaded image"
      />
      <Image
        v-else="imagePublicId"
        imgClass="w-full h-96 object-cover md:rounded-xl"
        :imagePublicId="imagePublicId"
        imgSizeSmall="h_420,w_420"
        imgSizeLarge="h_460,w_780"
        imgSizeDefault="h_420,w_350"
      />
      <div class="md:justify-between md:items-center md:flex hidden mt-3">
        <label
          class="block cursor-pointer group p-2 text-stone-400"
          for="uploadImage"
          role="button"
          tabindex="0"
          @keydown.enter="clickFileInput"
          @keydown.space="clickFileInput"
        >
          <span class="text-yellow-400 font-semibold group-hover:text-yellow-300">Change</span>
           photo
        </label>
        <Button class="p-2 text-red-400 font-semibold hover:text-red-300" @click="deleteImage">
          Delete
        </Button>
      </div>
      <div class="flex justify-between items-center md:hidden -mt-24 mb-14 px-3">
        <label
          for="uploadImage"
          class="bg-white flex items-center shadow px-3 py-2 rounded-lg hover:bg-yellow-400
          hover:text-white"
        >
          <ImageUploadIcon class="w-6 h-6" aria-hidden focusable="false"/>
          <span>Change photo</span>
        </label>
        <Button type="white" @click="deleteImage">
          <DeleteIcon class="w-6 h-6 mr-1" aria-hidden focusable="false"/>
          Delete photo
        </Button>
      </div>
    </div>
    <div v-if="imageValidations.fileSize.hasError" class="validationError">
      {{ imageValidations.fileSize.message }}
    </div>
    <div v-if="imageValidations.fileExtension.hasError" class="validationError">
      {{ imageValidations.fileExtension.message }}
    </div>
  </div>
</template>

<style scoped>
.validationError {
  @apply px-3 py-1.5 w-full rounded border border-solid border-red-300 text-red-400 mt-1;
}
</style>