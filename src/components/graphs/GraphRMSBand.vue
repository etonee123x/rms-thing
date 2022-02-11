<template>
  <div class="graph-rms-band">
    <div class="graph-rms-band__title">{{ props.title }}:</div>
    <div class="graph-rms-band__interval">
      {{ props.bandValues.interval.min }}dB .. {{ props.bandValues.interval.max }}dB
    </div>
    <br />
  </div>
</template>

<script setup lang="ts">
import { RMSValue } from '@/functions/RMSHandler';

const props = defineProps<{
  bandValues: RMSValue;
  title: string;
}>();
</script>

<style lang="scss" scoped></style>
