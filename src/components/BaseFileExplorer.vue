<template>
  <div class="file-explorer">
    <div class="file-explorer__content">
      <div v-for="(file, idx) in files" :key="idx" class="file-explorer__item-wrapper">
        <div class="file-explorer__item">
          <div class="file-explorer__item-title">
            {{ titleWithoutExt(file.name) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    files?: File[];
  }>(),
  {
    files: () => [] as File[],
  },
);
const titleWithoutExt = (title: string) => {
  const result = title.split('.');
  result.pop();
  return result.join('.');
};
</script>

<style scoped lang="scss">
.file-explorer {
  &__content {
    box-shadow: 0px 0px 0px 1px grey inset;
    align-content: flex-start;
    display: flex;
    max-height: 40rem;
    flex-wrap: wrap;
    overflow-y: auto;
  }
  &__item-wrapper {
    display: -webkit-box;
    display: -moz-box;
    height: 10rem;
    width: 10rem;
    padding: 0.25rem;
  }
  &__item {
    cursor: pointer;
    margin: auto auto;
    box-shadow: 0px 0px 0px 1px red inset;
    height: 95%;
    width: 95%;
    &:hover {
      background-color: red;
    }
  }
  &__item-title {
    @include font-litle-caption;
    margin: 0.25rem;
  }
}
</style>
