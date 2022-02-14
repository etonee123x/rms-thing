<template>
  <div class="page">
    <div class="page__title">Admin page</div>
    <div class="page__content">
      <BaseFileInput :allow-multiple="true" class="page__file-input" @uploaded="uploaded" />
      <FileExplorer
        v-if="adminStore.choosenTracks.length"
        :files="adminStore.choosenTracks"
        class="page__file-explorer"
      />
      <BaseTagDefiner v-if="adminStore.choosenTracks.length" class="page__tag-definer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseFileInput from '@/components/BaseFileUploader.vue';
import FileExplorer from '@/components/FileExplorer.vue';
import { useAdminStore } from '@/stores/admin';
import BaseTagDefiner from '@/components/TagDefiner.vue';
const adminStore = useAdminStore();

const uploaded = (filesArray: File[]) => {
  adminStore.load(filesArray);
};
</script>

<style scoped lang="scss">
.page {
  &__title {
    @include font-page-title;
    margin: 0 0 1rem 1rem;
  }
  &__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
