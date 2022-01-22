<template>
  <input :multiple="props.allowMultiple" type="file" @change="uploaded" />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    allowMultiple?: boolean;
    allowedExtensions?: Array<string>;
  }>(),
  {
    allowMultiple: false,
    allowedExtensions: () => ['mp3', 'wav'],
  },
);

const emit = defineEmits(['uploaded', 'badValidation']);

const filesWithBadValidation: File[] = [];

const uploaded = (e: Event) => {
  const target = e.currentTarget as HTMLInputElement;
  if (!target.files) return;
  const filesArray = Array.from((target.files as FileList)[Symbol.iterator]());
  const allowedFilesArray = filesArray.filter(file => validate(file));
  if (filesWithBadValidation.length) emit('badValidation', filesWithBadValidation);
  emit('uploaded', allowedFilesArray);
};

const validate = (file: File): boolean => {
  const ext = file.name.split('.').pop();
  if (!ext) {
    filesWithBadValidation.push(file);
    return false;
  }
  const result = props.allowedExtensions.includes(ext);
  if (!result) filesWithBadValidation.push(file);
  return result;
};
</script>

<style></style>
