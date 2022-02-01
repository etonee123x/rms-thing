<template>
  <div class="tag-definer">
    <div v-for="(tag, idx) in tags" :key="idx" class="tag-definer__tag-wrapper">
      <BaseTagItem :view="tag.view" :tag-type="tag.tagType" class="tag-definer__tag-item">
        {{ tag.title }}
      </BaseTagItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseTagItem from './BaseTagItem.vue';
import { TagType } from '@/types';
const tags: TagType[] = [
  {
    title: 'Artist',
    view: 'text',
    tagType: 'artists',
  },
  {
    title: 'Track title',
    view: 'text',
    tagType: 'track-titles',
  },
  {
    title: 'Genre',
    view: 'combobox',
    tagType: 'genres',
  },
  {
    title: 'Country',
    view: 'combobox',
    tagType: 'countries',
  },
  {
    title: 'Years',
    view: 'combobox',
    tagType: 'years',
  },
];
</script>

<style scoped lang="scss">
.tag-definer {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  height: 15rem;
  width: 100%;
  border: 1px blue solid;
}
</style>
