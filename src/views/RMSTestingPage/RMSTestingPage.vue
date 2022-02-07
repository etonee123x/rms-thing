<template>
  <div class="page">
    <div class="page__title">RMS testing page</div>
    <div class="page__content">
      <BaseFileInput class="page__file-input" @uploaded="uploaded" />
      <GraphSpectrum class="page__graph" :spectrum-values="spectrumValues" />
      <GraphRMSValues class="page__graph" :rms-values="rmsValues" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseFileInput from '@/components/BaseFileUploader.vue';
import { GraphRMSValues, GraphSpectrum } from '@/components/graphs';
import TheAnalyzer, { RMSValues, SpectrumValues } from '@/functions/RMSHandler';
import { convertSingleFile } from '@/functions/converters';

const rmsValues = ref<RMSValues | null>(null);
const spectrumValues = ref<SpectrumValues | null>(null);

const uploaded = async (filesArray: File[]) => {
  const wavData = await convertSingleFile(filesArray[0]);
  const theAnalyzer = new TheAnalyzer(wavData);

  rmsValues.value = theAnalyzer.getRMS();
  console.log(rmsValues.value);

  spectrumValues.value = theAnalyzer.getSpectrum();
  console.log(spectrumValues.value);
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
