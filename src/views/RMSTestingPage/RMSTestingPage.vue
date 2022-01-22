<template>
  <div class="page">
    <div class="page__title">RMS testing page</div>
    <div class="page__content">
      <BaseFileInput class="page__file-input" @uploaded="uploaded" />
      <BaseGraph class="page__graph" :results="rmsScriptAnswer" />
    </div>
    <pre>{{ rmsScriptAnswer }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseFileInput from '@/components/BaseFileUploader.vue';
import BaseGraph from '@/components/BaseGraph.vue';
import RMSHandler, { Results } from '@/functions/RMSHandler';
import { convertSingleFile } from '@/functions/converters';

const rmsScriptAnswer = ref<Results | null>(null);

const uploaded = async (filesArray: File[]) => {
  const wavData = await convertSingleFile(filesArray[0]);
  const rmsHandler = new RMSHandler().fromBuffer(wavData);
  rmsScriptAnswer.value = rmsHandler.formInfo();
};
</script>

<style scoped lang="scss">
.page {
  &__title {
    @include font-page-title;
    margin: 0 0 1rem 1rem;
  }
}
</style>
