<template>
  <div class="tag">
    <div class="tag__title">
      <slot></slot>
    </div>
    <select v-if="isCombobox">
      <option v-for="(option, idx) in options" :key="idx">{{ option }}</option>
    </select>
    <input v-else type="text" />
    <pre>{{ options }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AvailableTagTypes, AvailableTagViews } from '@/types';
import { useTagsStore } from '@/stores/tags';

const props = defineProps<{
  view: AvailableTagViews;
  tagType: AvailableTagTypes;
}>();

const tagsStore = useTagsStore();

const isCombobox = computed(() => props.view === 'combobox');
const options = tagsStore.getByTagType(props.tagType);
/* if (isCombobox.value) */ tagsStore.loadByTagType(props.tagType);
</script>

<style scoped lang="scss">
.tag {
  border: 1px darkcyan dashed;
}
</style>
