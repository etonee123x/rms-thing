<template>
  <div class="rms-graph">
    <div class="rms-graph__title">RMS analyzing results:</div>
    <GraphRMSBand :band-values="props.rmsValues.all" title="All frequencies" class="rms-graph__band-info" />
    <GraphRMSBand
      :band-values="props.rmsValues.b"
      :title="`Frequencies to ${props.rmsValues.b.textBand.to} Hz`"
      class="rms-graph__band-info"
    />
    <GraphRMSBand
      :band-values="props.rmsValues.lm"
      :title="`Frequencies from ${props.rmsValues.lm.textBand.from} Hz to ${props.rmsValues.lm.textBand.to} Hz`"
      class="rms-graph__band-info"
    />
    <GraphRMSBand
      :band-values="props.rmsValues.hm"
      :title="`Frequencies from ${props.rmsValues.hm.textBand.from} Hz to ${props.rmsValues.hm.textBand.to} Hz`"
      class="rms-graph__band-info"
    />
    <GraphRMSBand
      :band-values="props.rmsValues.h"
      :title="`Frequencies from ${props.rmsValues.h.textBand.from} Hz`"
      class="rms-graph__band-info"
    />
  </div>
</template>

<script setup lang="ts">
import GraphRMSBand from './GraphRMSBand.vue';

import { RMSValues } from '@/functions/RMSHandler';

const props = defineProps<{
  rmsValues: RMSValues;
}>();
</script>

<style lang="scss" scoped>
.rms-graph {
}
</style>
