<script setup lang="ts">
import { getDPR } from '@/stores/utility';
import { onMounted, ref } from 'vue';

const props = defineProps<{
  imagePublicId: string,
  imgClass: string,
  imgSizeSmall: string;
  imgSizeLarge: string;
  imgSizeDefault: string;
  imageRatio?: string;
}>();
const imgEl = ref<HTMLImageElement | null>(null);
const isLoading = ref(false);
const imageUrlStart = 'https://res.cloudinary.com/sicccookbook/image/upload/f_auto/q_auto/c_fill,';
const dpr = getDPR();
const aspectRatio = props.imageRatio || 'aspect-auto';

const onImageLoad = () => {
  if (imgEl.value) {
    isLoading.value = !(imgEl.value.complete && imgEl.value.naturalHeight !== 0);
  }
};

onMounted(() => {
  setTimeout(() => {
    if (!imgEl.value?.complete) {
      isLoading.value = true;
      imgEl.value?.addEventListener('load', onImageLoad);
    } else {
      isLoading.value = false;
    }
  }, 1000);
});

</script>
<template>
  <div v-show="isLoading" :class="`${props.imgClass} ${aspectRatio} relative -z-10`">
    <div class="absolute inset-0 bg-stone-200 animate-pulse-fast"></div>
  </div>
  <picture v-show="!isLoading">
    <source
      :srcset="`${ imageUrlStart }${props.imgSizeSmall},${dpr}/v1/${ imagePublicId }`"
      media="(max-width:425px)"
    />
    <source
      :srcset="`${ imageUrlStart }${props.imgSizeLarge},${dpr}/v1/${ imagePublicId }`"
      media="(max-width:767px)"
    />
    <img
      ref="imgEl"
      :class="`${props.imgClass} ${aspectRatio}`"
      :src="`${ imageUrlStart }${props.imgSizeDefault},${dpr}/v1/${ imagePublicId }`"
      alt=""
    />
  </picture>
</template>