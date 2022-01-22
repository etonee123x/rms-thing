<template>
  <ul class="file-explorer">
    <li v-for="file in files" :key="file.name" v-text="file.name"></li>
  </ul>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    files?: File[];
  }>(),
  {
    files: () => [] as File[],
  },
);
</script>

<style></style>
