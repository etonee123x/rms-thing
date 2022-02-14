<template>
  PROGRESS:
  <div class="progress-bar">
    <div :style="{ width: `${props.progress * 100}%` }" class="progress-bar__filler" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const progressColor = computed(() => {
  if (props.progress < 0.5) return `rgb(${(1 - props.progress) * 255}, ${props.progress * 192}, 0)`;
  return `rgb(${(1 - props.progress) * 255}, ${props.progress * 192}, 0)`;
});
const props = defineProps<{ progress: number }>();
</script>

<style lang="scss" scoped>
.progress-bar {
  height: 2rem;
  width: 15rem;
  outline: black solid 1px;
  &__filler {
    height: 100%;
    background-color: v-bind('progressColor');
  }
}
</style>
