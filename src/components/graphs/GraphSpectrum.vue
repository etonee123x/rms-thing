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
    
    console.log(props.spectrumValues);
    
    const width = props.spectrumValues.lengthX;
    const height = props.spectrumValues.lengthY;
    let x = 0;
    let y = height;
    
    canvas.width = width;
    canvas.height = height;
    
    props.spectrumValues.spectrum.forEach(timestamp => {
        y = height;
        timestamp.forEach((value, i) => {
            const valueDb = Number((20 * Math.log10(value)).toFixed(2));
            let percentValueDb = 0;
            
            if (value > 0) {
                percentValueDb = (valueDb / 120);
            }
            
            /*
            if (valueDb >= -20) {
                console.log(valueDb + ' - ' + getColorForDb(valueDb));
            }
            */
            
            ctx.fillStyle = getColorForDb(valueDb, colorsForScale[2]);
            ctx.fillRect(x, y, 1, 1);
            y--;
        });
        
        x++;
    });
    
    document.querySelector('.graph-wrapper').appendChild(canvas);
}

const colorsForScale = [
    {
        minDb: -120,
        maxDb: -20,
        stops: [
            {
                db: -120,
                color: {
                    r: 0,
                    g: 0,
                    b: 0
                }
            },
            {
                db: -110,
                color: {
                    r: 62,
                    g: 0,
                    b: 178
                }
            },
            {
                db: -100,
                color: {
                    r: 19,
                    g: 1,
                    b: 251
                }
            },
            {
                db: -90,
                color: {
                    r: 3,
                    g: 104,
                    b: 252
                }
            },
            {
                db: -80,
                color: {
                    r: 2,
                    g: 239,
                    b: 255
                }
            },
            {
                db: -70,
                color: {
                    r: 9,
                    g: 255,
                    b: 0
                }
            },
            {
                db: -60,
                color: {
                    r: 102,
                    g: 255,
                    b: 0
                }
            },
            {
                db: -50,
                color: {
                    r: 202,
                    g: 255,
                    b: 0
                }
            },
            {
                db: -40,
                color: {
                    r: 255,
                    g: 207,
                    b: 7
                }
            },
            {
                db: -30,
                color: {
                    r: 250,
                    g: 105,
                    b: 0
                }
            },
            {
                db: -20,
                color: {
                    r: 226,
                    g: 15,
                    b: 15
                }
            }
        ]
    },
    {
        minDb: -100,
        maxDb: 0,
        stops: [
            {
                db: -130,
                color: {
                    r: 0,
                    g: 0,
                    b: 0
                }
            },
            {
                db: -120,
                color: {
                    r: 0,
                    g: 0,
                    b: 62
                }
            },
            {
                db: -84,
                color: {
                    r: 45,
                    g: 0,
                    b: 99
                }
            },
            {
                db: -63,
                color: {
                    r: 100,
                    g: 0,
                    b: 124
                }
            },
            {
                db: -48,
                color: {
                    r: 156,
                    g: 0,
                    b: 81
                }
            },
            {
                db: -36,
                color: {
                    r: 198,
                    g: 0,
                    b: 41
                }
            },
            {
                db: -27,
                color: {
                    r: 240,
                    g: 3,
                    b: 0
                }
            },
            {
                db: -19,
                color: {
                    r: 252,
                    g: 122,
                    b: 0
                }
            },
            {
                db: -12,
                color: {
                    r: 255,
                    g: 211,
                    b: 20
                }
            },
            {
                db: -5,
                color: {
                    r: 255,
                    g: 255,
                    b: 152
                }
            },
            {
                db: 0,
                color: {
                    r: 255,
                    g: 255,
                    b: 255
                }
            }
        ]
    },
    {
        minDb: -100,
        maxDb: 0,
        stops: [
            {
                db: -130,
                color: {
                    r: 0,
                    g: 0,
                    b: 0
                }
            },
            {
                db: -68,
                color: {
                    r: 128,
                    g: 0,
                    b: 128
                }
            },
            {
                db: -59,
                color: {
                    r: 0,
                    g: 0,
                    b: 255
                }
            },
            {
                db: -51,
                color: {
                    r: 0,
                    g: 255,
                    b: 255
                }
            },
            {
                db: -45,
                color: {
                    r: 0,
                    g: 255,
                    b: 0
                }
            },
            {
                db: -39,
                color: {
                    r: 255,
                    g: 255,
                    b: 0
                }
            },
            {
                db: 0,
                color: {
                    r: 255,
                    g: 0,
                    b: 0
                }
            }
        ]
    }
];

const getColorForDb = function(db, colors)
{
    /* if it goes outside the edges */
    if (db <= colors.minDb) {
        return 'rgb(' + colors.stops[0].color.r + ', ' + colors.stops[0].color.g + ', ' + colors.stops[0].color.b + ')';
    }
    
    if (db >= colors.maxDb) {
        return 'rgb(' + colors.stops.at(-1).color.r + ', ' + colors.stops.at(-1).color.g + ', ' + colors.stops.at(-1).color.b + ')';
    }
    
    let index = 1;
    for (let i = 1; i < colors.stops.length - 1; i++) {
        if (db < colors.stops[i].db) {
            index = i;
            break;
        }
    }
    
    const colorStart = colors.stops[index - 1];
    const colorEnd = colors.stops[index];
    const dbRange = (db - colorStart.db) / (colorEnd.db - colorStart.db);
    const dbMin = 1 - dbRange;
    const dbMax = dbRange;

    return 'rgb(' +
        Math.floor(colorStart.color.r * dbMin + colorEnd.color.r * dbMax) + ',' +
        Math.floor(colorStart.color.g * dbMin + colorEnd.color.g * dbMax) + ',' +
        Math.floor(colorStart.color.b * dbMin + colorEnd.color.b * dbMax) + ')';
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
