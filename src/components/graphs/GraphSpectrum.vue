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
            const valueDb = Number((20 * Math.log10(value)).toFixed(2));
            let percentValueDb = 0;
            
            if (value > 0) {
                percentValueDb = (valueDb / 120);
            }
            
            if (i === 0) {
                console.log(percentValueDb);
            }
            
            ctx.fillStyle = getColorForPercentage(percentValueDb);
            ctx.fillRect(x, y, 1, 1);
            y--;
        });
        
        x++;
    });
    
    document.querySelector('.graph-wrapper').appendChild(canvas);
}

const colors = [
    {
        percent: 0.0,
        color: {
            r: 0,
            g: 0,
            b: 0
        }
    },
    {
        percent: 0.1,
        color: {
            r: 51,
            g: 51,
            b: 153
        }
    },
    {
        percent: 0.2,
        color: {
            r: 0,
            g: 0,
            b: 255
        }
    },
    {
        percent: 0.3,
        color: {
            r: 51,
            g: 153,
            b: 255
        }
    },
    {
        percent: 0.4,
        color: {
            r: 0,
            g: 255,
            b: 255
        }
    },
    {
        percent: 0.5,
        color: {
            r: 51,
            g: 204,
            b: 51
        }
    },
    {
        percent: 0.6,
        color: {
            r: 102,
            g: 255,
            b: 51
        }
    },
    {
        percent: 0.7,
        color: {
            r: 255,
            g: 255,
            b: 0
        }
    },
    {
        percent: 0.8,
        color: {
            r: 255,
            g: 103,
            b: 51
        }
    },
    {
        percent: 0.9,
        color: {
            r: 255,
            g: 51,
            b: 0
        }
    },
    {
        percent: 1,
        color: {
            r: 255,
            g: 0,
            b: 0
        }
    }
];

const getColorForPercentage = function(percent)
{
    let index = 1;
    for (let i = 1; i < colors.length - 1; i++) {
        if (percent < colors[i].percent) {
            index = i;
            break;
        }
    }
    
    const colorStart = colors[index - 1];
    const colorEnd = colors[index];
    const percentRange = (percent - colorStart.percent) / (colorEnd.percent - colorStart.percent);
    const percentMin = 1 - percentRange;
    const percentMax = percentRange;

    return 'rgb(' +
        Math.floor(colorStart.color.r * percentMin + colorEnd.color.r * percentMax) + ',' +
        Math.floor(colorStart.color.g * percentMin + colorEnd.color.g * percentMax) + ',' +
        Math.floor(colorStart.color.b * percentMin + colorEnd.color.b * percentMax) + ')';
};
    
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
