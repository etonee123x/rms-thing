<template>
  <div></div>
</template>

<script setup lang="ts">
import { SpectrumValues } from '@/functions/RMSHandler';
const props = withDefaults(
  defineProps<{
    spectrumValues: SpectrumValues | null;
  }>(),
  {
    spectrumValues: null,
  },
);
</script>

<style></style>
