<template>
  <div class="page">
    <div class="page__title">RMS testing page</div>
    <div class="page__content">
      <BaseFileInput @uploaded="uploaded" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseFileInput from '@/components/BaseFileUploader.vue';
import f2BTransform from '@/functions/fileToBufferTransformer';

const uploaded = async (filesArray: File[]) => {
  console.log(await f2BTransform(filesArray[0]));
};
</script>

<style scoped lang="scss">
.page {
  &__title {
    @include font-page-title;
    margin: 0 0 1rem 1rem;
  }
}
</style>
