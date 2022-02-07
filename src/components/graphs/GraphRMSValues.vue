<template>
  <div></div>
</template>

<script setup lang="ts">
import { RMSValues } from '@/functions/RMSHandler';
const props = withDefaults(
  defineProps<{
    rmsValues: RMSValues | null;
  }>(),
  {
    rmsValues: null,
  },
);
</script>

<style></style>
