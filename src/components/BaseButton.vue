<template>
  <div :class="buttonClasses" @click="click">
    <div class="button__text">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    enabled?: boolean;
  }>(),
  {
    enabled: true,
  },
);

const emit = defineEmits(['click']);

const buttonClasses = computed(() => ['button', props.enabled ? 'button_enabled' : 'button_disabled']);

const click = () => {
  if (props.enabled) emit('click');
};
</script>

<style lang="scss" scoped>
.button {
  &_enabled {
    cursor: pointer;
    background-color: red;
  }
  &_disabled {
    background-color: rgba($color: red, $alpha: 0.4);
  }
  &__text {
    padding: 0.5rem;
    user-select: none;
    color: white;
  }
}
</style>
