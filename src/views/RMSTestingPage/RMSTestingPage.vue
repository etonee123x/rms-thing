<template>
  <div class="page">
    <div class="page__title">RMS testing page</div>
    <div class="page__content">
      <BaseFileInput class="page__file-input" @uploaded="uploaded" />
      <div class="page__results">
        <pre>{{ actionsInProcess }}</pre>
        <pre>{{ isWaiting }}</pre>
        <BaseWaiter :is-waiting="isWaiting" :actions-in-process="actionsInProcess">
          <GraphSpectrum
            v-if="spectrumValues"
            class="page__graph"
            :spectrum-values="spectrumValues"
            :nyquist-frequency="nyquistFrequency"
          />
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

import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import TheAnalyzer, { RMSValues, SpectrumValues, SpectrumOptions, RMSOptions } from '@/functions/RMSHandler';
import { convertSingleFile } from '@/functions/converters';
import { useWaiterStore, waitersActions } from '@/stores/waiter';

const waiterStore = useWaiterStore();
const isWaiting = storeToRefs(waiterStore).isWaitingForSomething;
const actionsInProcess = storeToRefs(waiterStore).whatWeAreWaitingFor;
const actionsList = waitersActions.THE_ANALYZER;

const rmsValues = ref<RMSValues | null>(null);
const spectrumValues = ref<SpectrumValues | null>(null);
const nyquistFrequency = ref<number | null>(null);

const uploaded = async (filesArray: File[]) => {
  let wavData: Buffer;
  if (filesArray[0].type === 'audio/wav') wavData = Buffer.from(await filesArray[0].arrayBuffer());
  else {
    waiterStore.addAction(actionsList.CONVERTING);
    console.log(actionsInProcess.value);
    wavData = await convertSingleFile(filesArray[0]);
    waiterStore.removeAction(actionsList.CONVERTING);
    console.log(actionsInProcess.value);
  }

  waiterStore.addAction(actionsList.GETTING_THE_LOUDEST_SEGMENT);
  const theAnalyzer = new TheAnalyzer(wavData);
  waiterStore.removeAction(actionsList.GETTING_THE_LOUDEST_SEGMENT);

  nyquistFrequency.value = theAnalyzer.sampleRate / 2;

  waiterStore.addAction(actionsList.GETTING_RMS);
  const rmsOptions: RMSOptions = theAnalyzer.DEFAULT_RMS_OPTIONS_FOR_THIS_SAMPLE_RATE;
  theAnalyzer.getRMS(rmsOptions, false).then(result => {
    rmsValues.value = result;
    waiterStore.removeAction(actionsList.GETTING_RMS);
  });

  waiterStore.addAction(actionsList.GETTING_SPECTRUM);
  const spectrumOptions: SpectrumOptions = TheAnalyzer.DEFAULT_SPECTRUM_OPTIONS;
  theAnalyzer.getSpectrum(spectrumOptions).then(result => {
    spectrumValues.value = result;
    waiterStore.removeAction(actionsList.GETTING_SPECTRUM);
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
