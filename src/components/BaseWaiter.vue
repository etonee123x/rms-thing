<template>
  <div v-if="props.isEnabled">
    <div v-if="props.isWaiting" class="waiter">
      <div class="waiter__in-processing">
        <div class="waiter__loading-spinner" />
        <div class="waiter__text">WAITING FOR:</div>
        <div v-for="(action, idx) in props.actionsInProcess" :key="idx" class="waiter__action">{{ action.text }}</div>
        <BaseProgressBar v-if="shouldShowProgressBar" :progress="(props.progress as number)" />
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script setup lang="ts">
import { Action } from '@/types';
import { computed } from 'vue';
import BaseProgressBar from './BaseProgressBar.vue';

const shouldShowProgressBar = computed(() => props.progress !== null);

const props = withDefaults(
  defineProps<{
    isWaiting: boolean;
    actionsInProcess?: Array<Action>;
    isEnabled: boolean;
    progress?: number | null;
  }>(),
  {
    actionsInProcess: () => [],
    progress: null,
  },
);
</script>

<style lang="scss"></style>
