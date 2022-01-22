<template>
  <div class="page">
    <div class="page__title">Admin page</div>
    <div class="page__content">
      <BaseFileInput :allow-multiple="true" />
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
    margin: 0 0 1rem 1rem;
  }
}
</style>
