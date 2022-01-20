<template>
  <div class="page">
    <div class="page__title">RMS testing page</div>
    <div class="page__content">
      <BaseFileInput />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseFileInput from '@/components/BaseFileUploader.vue';
</script>

<style scoped lang="scss">
.page {
  &__title {
    @include font-page-title;
  }
}
</style>
