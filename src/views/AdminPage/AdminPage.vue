<template>
  <div class="page">
    <div class="page__title">Admin page</div>
    <div class="page__content">
      <BaseFileInput :allow-multiple="true" @uploaded="uploaded" />
      <FileExplorer :files="theFilesArray" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseFileInput from '@/components/BaseFileUploader.vue';
import FileExplorer from '@/components/FileExplorer.vue';
import { ref } from 'vue';
const theFilesArray = ref<File[]>([]);

const uploaded = function(filesArray: File[])
{
    theFilesArray.value = filesArray;
}
</script>

<style scoped lang="scss">
.page {
  &__title {
    @include font-page-title;
    margin: 0 0 1rem 1rem;
  }
}
</style>
