<template>
  <input :type="props.type" @input="input" />
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue']);

const props = withDefaults(
  defineProps<{
    type?: 'password' | 'text';
    modelValue: string;
  }>(),
  {
    type: 'text',
  },
);

const input = (e: Event) => {
  emit('update:modelValue', ((e as InputEvent).target as HTMLInputElement).value);
};
</script>

<style lang="scss" scoped></style>
