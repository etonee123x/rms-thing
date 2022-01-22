<template>
  <div class="page">
    <div class="page__title">Main page</div>
    <div class="page__content"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.page {
  &__title {
    @include font-page-title;
    margin: 0 0 1rem 1rem;
  }
}
</style>
