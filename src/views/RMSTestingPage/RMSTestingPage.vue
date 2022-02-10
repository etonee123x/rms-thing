<template>
  <div class="page">
    <div class="page__title">RMS testing page</div>
    <div class="page__content">
      <BaseFileInput class="page__file-input" @uploaded="uploaded" />
      <GraphSpectrum class="page__graph" v-if="spectrumValues" :spectrum-values="spectrumValues" />
      <GraphRMSValues class="page__graph" :rms-values="rmsValues" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseFileInput from '@/components/BaseFileUploader.vue';
import { GraphRMSValues, GraphSpectrum } from '@/components/graphs';
import TheAnalyzer, { RMSValues, SpectrumValues, SpectrumOptions, RMSOptions } from '@/functions/RMSHandler';
import { convertSingleFile } from '@/functions/converters';

const rmsValues = ref<RMSValues | null>(null);
const spectrumValues = ref<SpectrumValues | null>(null);

const uploaded = async (filesArray: File[]) => {
  console.time('converting');
  const wavData = await convertSingleFile(filesArray[0]);
  console.timeEnd('converting');

  console.time('the loudest segment');
  const theAnalyzer = new TheAnalyzer(wavData);
  console.timeEnd('the loudest segment');

  console.time('rms');
  const rmsOptions: RMSOptions = TheAnalyzer.DEFAULT_RMS_OPTIONS;
  theAnalyzer.getRMS(rmsOptions).then(result => {
    rmsValues.value = result;
    console.timeEnd('rms');
    console.log(rmsValues.value);
  });

  console.time('spectrum');
  const spectrumOptions: SpectrumOptions = TheAnalyzer.DEFAULT_SPECTRUM_OPTIONS;
  theAnalyzer.getSpectrum(spectrumOptions).then(result => {
    spectrumValues.value = result;
    console.timeEnd('spectrum');
    console.log(spectrumValues.value);
  });
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
