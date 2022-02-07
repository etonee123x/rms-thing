<template>
  <div></div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    spectrumArray: number[][] | null;
  }>(),
  {
    spectrumArray: null,
  },
);
</script>

<style></style>
