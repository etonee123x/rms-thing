<template>
  <div :class="checkboxClasses">
    <div class="checkbox__body body" @click="$emit('update:modelValue', !props.modelValue)">
      <div class="checkbox__pointer"></div>
    </div>
    <div class="checkbox__text">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ modelValue: boolean }>();

defineEmits(['update:modelValue']);

const checkboxClasses = computed(() => ['checkbox', props.modelValue ? 'checkbox_active' : 'checkbox_inactive']);
</script>

<style lang="scss" scoped>
.checkbox {
  display: flex;
  gap: 0.5rem;
  &__body {
    width: 1rem;
    height: 1rem;
    outline: 1px solid black;
  }
  &_inactive {
    .body {
      background-color: white;
    }
  }

  &_active {
    .body {
      background-color: red;
    }
  }
  &__text {
    user-select: none;
  }
}
</style>
