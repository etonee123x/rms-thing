<template>
  <div class="page">
    <div class="page__title">RMS testing page</div>
    <div class="page__content">
      <BaseFileInput class="page__file-input" @uploaded="uploaded" />
      <BaseWaiter :is-enabled="isAudioChoosen" :is-waiting="isWaiting" :actions-in-process="actionsInProcess">
        <div class="page__form form">
          <BaseCheckbox v-model="model.getRMS" class="form__checkbox">Find RMS values</BaseCheckbox>
          <BaseCheckbox v-model="model.getSpectrum" class="form__checkbox">Draw spectrogram values</BaseCheckbox>
          <BaseButton class="form__button" :enabled="isProcessButtonEnabled" @click="process">Process</BaseButton>
        </div>
        <BaseWaiter :is-enabled="isProcessingStarted" :is-waiting="isWaiting" :actions-in-process="actionsInProcess">
          <div class="page__results">
            <GraphSpectrum v-if="spectrumResults" class="page__graph" :spectrum-values="spectrumResults" />
            <GraphRMSValues v-if="rmsResults" class="page__graph" :rms-values="rmsResults" />
          </div>
        </BaseWaiter>
      </BaseWaiter>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseFileInput from '@/components/BaseFileUploader.vue';
import { GraphRMSValues, GraphSpectrum } from '@/components/graphs';
import BaseWaiter from '@/components/BaseWaiter.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseCheckbox from '@/components/BaseCheckbox.vue';

import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import TheAnalyzer, { RMSValues, SpectrumValues, SpectrumOptions, RMSOptions } from '@/functions/RMSHandler';
import { convertSingleFile } from '@/functions/converters';
import { useWaiterStore, waitersActions } from '@/stores/waiter';
import { Buffer } from 'buffer';

const waiterStore = useWaiterStore();
const isWaiting = storeToRefs(waiterStore).isWaitingForSomething;
const actionsInProcess = storeToRefs(waiterStore).whatWeAreWaitingFor;
const actionsList = waitersActions.THE_ANALYZER;

const rmsResults = ref<RMSValues | null>(null);
const spectrumResults = ref<SpectrumValues | null>(null);
const wavData = ref<Buffer | null>(null);

const isAudioChoosen = ref<boolean>(false);
const isProcessingStarted = ref<boolean>(false);
const isProcessButtonEnabled = computed(() => model.value.getRMS || model.value.getSpectrum);

const model = ref<{
  getRMS: boolean;
  getSpectrum: boolean;
}>({
  getRMS: true,
  getSpectrum: false,
});

const uploaded = async (filesArray: File[]) => {
  if (actionsInProcess.value.length) return;
  isAudioChoosen.value = true;
  isProcessingStarted.value = false;
  if (filesArray[0].type === 'audio/wav') return (wavData.value = Buffer.from(await filesArray[0].arrayBuffer()));

  waiterStore.addAction(actionsList.CONVERTING);
  wavData.value = await convertSingleFile(filesArray[0]);
  waiterStore.removeAction(actionsList.CONVERTING);
};

const process = async () => {
  if (!wavData.value) return;
  const getRMS = async () => {
    waiterStore.addAction(actionsList.GETTING_RMS);

    const rmsOptions: RMSOptions = theAnalyzer.DEFAULT_RMS_OPTIONS_FOR_THIS_SAMPLE_RATE;

    theAnalyzer.getRMS(rmsOptions, false).then(result => {
      rmsResults.value = result;
      waiterStore.removeAction(actionsList.GETTING_RMS);
    });
  };

  const getSpectrum = async () => {
    waiterStore.addAction(actionsList.GETTING_SPECTRUM);

    const spectrumOptions: SpectrumOptions = TheAnalyzer.DEFAULT_SPECTRUM_OPTIONS;
    /*
    const spectrumOptionsChanged = {
        windowSize: 8192,
        delayBetweenOperations: 5,
        overlap: 0,
        shouldUseWindowFunction: false,
    }
    */

    theAnalyzer.getSpectrum(spectrumOptions).then(result => {
      spectrumResults.value = result;
      waiterStore.removeAction(actionsList.GETTING_SPECTRUM);
    });
  };

  isProcessingStarted.value = true;

  waiterStore.addAction(actionsList.GETTING_THE_LOUDEST_SEGMENT);
  const theAnalyzer = new TheAnalyzer(wavData.value);
  waiterStore.removeAction(actionsList.GETTING_THE_LOUDEST_SEGMENT);

  if (model.value.getRMS) getRMS();

  if (model.value.getSpectrum) getSpectrum();
};
</script>

<style scoped lang="scss">
.page {
  &__title {
    @include font-page-title;
    margin: 0 0 1rem 1rem;
  }
  &__content {
  }
}
</style>
