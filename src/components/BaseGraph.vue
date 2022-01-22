<template>
  <div></div>
</template>

<script setup lang="ts">
import { Results } from '@/functions/RMSHandler';
const props = withDefaults(defineProps<{ results?: Results | null }>(), { results: null });
</script>

<style></style>
