<template>
  <input :multiple="props.allowMultiple" type="file" @change="uploaded" />
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{ allowMultiple?: boolean }>(), { allowMultiple: false });
const uploaded = (e: Event) => {
  if (!(e.target as HTMLInputElement).files) return;
  console.log('hihih!!!');
};
</script>
<style></style>
