<template>
  <div class="page">
    <div class="page__title">RMS testing page</div>
    <div class="page__content">
      <BaseFileInput class="page__file-input" @uploaded="uploaded" />
      <div class="page__results">
        <pre>{{ actionsInProcess }}</pre>
        <BaseWaiter :is-waiting="isWaiting" :actions-in-process="actionsInProcess">
          <GraphSpectrum class="page__graph" v-if="spectrumValues" :spectrum-values="spectrumValues" :nyquist-frequency="nyquistFrequency" />
          <GraphRMSValues class="page__graph" :rms-values="rmsValues" />
        </BaseWaiter>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseFileInput from '@/components/BaseFileUploader.vue';
import { GraphRMSValues, GraphSpectrum } from '@/components/graphs';
import BaseWaiter from '@/components/BaseWaiter.vue';
import { Buffer } from 'buffer';

import { computed, ref } from 'vue';
import TheAnalyzer, { RMSValues, SpectrumValues, SpectrumOptions, RMSOptions } from '@/functions/RMSHandler';
import { convertSingleFile } from '@/functions/converters';
import { useWaiterStore, waitersActions } from '@/stores/waiter';

const waiterStore = useWaiterStore();
const isWaiting = computed(() => waiterStore.isWaitingForSomething);
const actionsInProcess = computed(() => waiterStore.whatWeAreWaitingFor);
const actionsList = waitersActions.THE_ANALYZER;

const rmsValues = ref<RMSValues | null>(null);
const spectrumValues = ref<SpectrumValues | null>(null);
const nyquistFrequency = ref<number | null>(null);

const uploaded = async (filesArray: File[]) => {
  let wavData;
  if (filesArray[0].type === 'audio/wav') wavData = Buffer.from(await filesArray[0].arrayBuffer());
  else {
    console.time('converting');
    waiterStore.addAction(actionsList.CONVERTING);
    wavData = await convertSingleFile(filesArray[0]);
    waiterStore.removeAction(actionsList.CONVERTING);
    console.timeEnd('converting');
  }

  console.time('the loudest segment');
  waiterStore.addAction(actionsList.GETTING_THE_LOUDEST_SEGMENT);
  const theAnalyzer = new TheAnalyzer(wavData);
  waiterStore.removeAction(actionsList.GETTING_THE_LOUDEST_SEGMENT);
  console.timeEnd('the loudest segment');

  nyquistFrequency.value = theAnalyzer.sampleRate / 2;

  console.time('rms');
  waiterStore.addAction(actionsList.GETTING_RMS);
  const rmsOptions: RMSOptions = theAnalyzer.DEFAULT_RMS_OPTIONS_FOR_THIS_SAMPLE_RATE;
  theAnalyzer.getRMS(rmsOptions, false).then(result => {
    rmsValues.value = result;
    waiterStore.removeAction(actionsList.GETTING_RMS);
    console.timeEnd('rms');
    console.log(rmsValues.value);
  });

  console.time('spectrum');
  waiterStore.addAction(actionsList.GETTING_SPECTRUM);
  const spectrumOptions: SpectrumOptions = TheAnalyzer.DEFAULT_SPECTRUM_OPTIONS;
  theAnalyzer.getSpectrum(spectrumOptions).then(result => {
    spectrumValues.value = result;
    waiterStore.removeAction(actionsList.GETTING_SPECTRUM);
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
