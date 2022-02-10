<template>
    <div class="graph">
        <div class="graph-wrapper"></div>
    </div>
</template>

<script setup lang="ts">
import { SpectrumValues } from '@/functions/RMSHandler';
import { onMounted } from 'vue'
const props = withDefaults(
  defineProps<{
    spectrumValues: SpectrumValues | null;
  }>(),
  {
    spectrumValues: null,
  },
);

const draw = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");
    
    const width = props.spectrumValues.length;
    const height = props.spectrumValues[0].length;
    let x = 0;
    let y = height;
    
    canvas.width = width;
    canvas.height = height;
    
    props.spectrumValues.forEach(timestamp => {
        y = height;
        timestamp.forEach((value, i) => {
            let r = 0;
            
            if (value > 0) {
                r = Math.round(value * 25500);
            }
            
            if (i === 0) {
                console.log(r);
            }
            
            ctx.fillStyle = 'rgb(' + r + ', 0, 0)';
            ctx.fillRect(x, y, 1, 1);
            y--;
        });
        
        x++;
    });
    
    document.querySelector('.graph-wrapper').appendChild(canvas);
}

onMounted(draw);
</script>

<style lang="scss">
    .graph {
        width: 100%;
        
        .graph-wrapper {
            position: relative;
            width: 100%;
            padding-bottom: 56.25%;
            z-index: 1;
            
            canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
        }
    }
</style>
