/*
  Works only with Int16 2channels 44100kHz wav files
*/
import { Buffer } from 'buffer';

type SampleRateValues = 44100 | 48000;

type Headers = {
  channelsNumber: number;
  sampleRate: SampleRateValues;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;
};

type Channels = {
  left: Float32Array;
  right: Float32Array;
};

type IntervalAndList = {
  interval: {
    min: number;
    max: number;
  };
  list: number[];
};

export interface RMSValue extends IntervalAndList {
  textBand: {
    from: number | string;
    to: number | string;
  };
}

type BandTitles = 'all' | 'b' | 'lm' | 'hm' | 'h';

export type RMSValues = Record<BandTitles, RMSValue>;

export type SpectrumValues = {
  spectrum: Float32Array[];
  nyquistFrequency: number;
  lengthX: number;
  lengthY: number;
};

type AudioSegment = {
  start: number;
  end: number;
};

type TheLoudestSegment = {
  borders: AudioSegment;
  channels: Channels;
};

type WavData = {
  headers?: Headers;
  compressionRate: number;
  compressedChannels?: Channels;
  duration?: number;
  theLoudestSegment?: TheLoudestSegment;
};

export type SpectrumOptions = {
  windowSize: 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384;
  overlap: number;
  delayBetweenOperations: number;
  shouldUseWindowFunction: boolean;
};

type onLoadingParams = {
  bandTitle: BandTitles;
  progress: number;
};

type OtherOptions = {
  useFastMode?: boolean;
  onLoading?: (arg0: onLoadingParams) => any;
};

export class Filter {
  private outPrev = 0;
  private outPrevPrev = 0;
  private c!: number;
  private a1!: number;
  private a2!: number;
  private a3!: number;
  private b1!: number;
  private b2!: number;
  private cutoff: number;
  private type: 'hp' | 'lp';

  constructor(cutoff: number, type: 'hp' | 'lp', sampleRate: SampleRateValues, resonance = TheAnalyzer.RESONANCE) {
    this.cutoff = cutoff;
    this.type = type;
    type === 'lp' ? this.setLPParams(cutoff, sampleRate, resonance) : this.setHPParams(cutoff, sampleRate, resonance);
  }

  private setLPParams(cutoff: number, sampleRate: SampleRateValues, resonance: number) {
    this.c = 1.0 / Math.tan((Math.PI * cutoff) / sampleRate);

    this.a1 = 1.0 / (1.0 + resonance * this.c + this.c * this.c);
    this.a2 = 2 * this.a1;
    this.a3 = this.a1;
    this.b1 = 2.0 * (1.0 - this.c * this.c) * this.a1;
    this.b2 = (1.0 - resonance * this.c + this.c * this.c) * this.a1;
  }

  private setHPParams(cutoff: number, sampleRate: SampleRateValues, resonance: number) {
    this.c = Math.tan((Math.PI * cutoff) / sampleRate);

    this.a1 = 1.0 / (1.0 + resonance * this.c + this.c * this.c);
    this.a2 = -2 * this.a1;
    this.a3 = this.a1;
    this.b1 = 2.0 * (this.c * this.c - 1.0) * this.a1;
    this.b2 = (1.0 - resonance * this.c + this.c * this.c) * this.a1;
  }

  public process(buffer: Float32Array) {
    const result = [];
    for (let i = 2; i < buffer.length; i++) {
      let out =
        this.a1 * buffer[i] +
        this.a2 * buffer[i - 1] +
        this.a3 * buffer[i - 2] -
        this.b1 * this.outPrev -
        this.b2 * this.outPrevPrev;
      if (out > 10 || out < -10) out = 0;
      this.outPrevPrev = this.outPrev;
      this.outPrev = out;
      result.push(out);
    }
    return new Float32Array(result);
  }

  public getCutoff() {
    return this.cutoff;
  }

  public getType() {
    return this.type;
  }
}

export type RMSOptions = {
  b: {
    lp: Filter;
  };
  lm: {
    lp: Filter;
    hp: Filter;
  };
  hm: {
    lp: Filter;
    hp: Filter;
  };
  h: {
    hp: Filter;
  };
};

interface Band {
  lp?: Filter;
  hp?: Filter;
}

class FourierTransform {
  protected readonly bufferSize: number;
  protected peakBand: number;
  protected peak: number;
  protected readonly spectrum: Float32Array;
  constructor(bufferSize: number) {
    this.bufferSize = bufferSize;
    this.spectrum = new Float32Array(bufferSize / 2);
    this.peakBand = 0;
    this.peak = 0;
  }
}

class RFFT extends FourierTransform {
  private readonly trans: Float32Array;
  private readonly reverseTable: Uint32Array;
  constructor(bufferSize: number) {
    super(bufferSize);
    this.trans = new Float32Array(bufferSize);
    this.reverseTable = new Uint32Array(bufferSize);
    this.generateReverseTable();
  }

  private reverseBinPermute(dest: Float32Array, source: Float32Array) {
    const bufferSize = this.bufferSize;
    const halfSize = bufferSize >>> 1;
    const nm1 = bufferSize - 1;
    let i = 1;
    let r = 0;
    let h;

    dest[0] = source[0];

    do {
      r += halfSize;
      dest[i] = source[r];
      dest[r] = source[i];

      i++;

      h = halfSize << 1;
      while (((h = h >> 1), !((r ^= h) & h)));

      if (r >= i) {
        dest[i] = source[r];
        dest[r] = source[i];

        dest[nm1 - i] = source[nm1 - r];
        dest[nm1 - r] = source[nm1 - i];
      }
      i++;
    } while (i < halfSize);
    dest[nm1] = source[nm1];
  }

  private generateReverseTable() {
    const bufferSize = this.bufferSize;
    const halfSize = bufferSize >>> 1;
    const nm1 = bufferSize - 1;
    let i = 1;
    let r = 0;
    let h;

    this.reverseTable[0] = 0;

    do {
      r += halfSize;

      this.reverseTable[i] = r;
      this.reverseTable[r] = i;

      i++;

      h = halfSize << 1;
      while (((h = h >> 1), !((r ^= h) & h)));

      if (r >= i) {
        this.reverseTable[i] = r;
        this.reverseTable[r] = i;

        this.reverseTable[nm1 - i] = nm1 - r;
        this.reverseTable[nm1 - r] = nm1 - i;
      }
      i++;
    } while (i < halfSize);

    this.reverseTable[nm1] = nm1;
  }

  public forward(buffer: Float32Array) {
    const n = this.bufferSize;
    const spectrum = this.spectrum;
    const x = this.trans;
    const TWO_PI = 2 * Math.PI;
    const sqrt = Math.sqrt;
    let i = n >>> 1;
    const bSi = 2 / n;
    let n2, n4, n8, nn, t1, t2, t3, t4, i1, i2, i3, i4, i5, i6, i7, i8, st1, cc1, ss1, cc3, ss3, e, a, rval, ival, mag;

    let ix, i0, id;

    this.reverseBinPermute(x, buffer);

    for (ix = 0, id = 4; ix < n; id *= 4) {
      for (i0 = ix; i0 < n; i0 += id) {
        st1 = x[i0] - x[i0 + 1];
        x[i0] += x[i0 + 1];
        x[i0 + 1] = st1;
      }
      ix = 2 * (id - 1);
    }

    n2 = 2;
    nn = n >>> 1;

    while ((nn = nn >>> 1)) {
      ix = 0;
      n2 = n2 << 1;
      id = n2 << 1;
      n4 = n2 >>> 2;
      n8 = n2 >>> 3;
      do {
        if (n4 !== 1)
          for (i0 = ix; i0 < n; i0 += id) {
            i1 = i0;
            i2 = i1 + n4;
            i3 = i2 + n4;
            i4 = i3 + n4;

            t1 = x[i3] + x[i4];
            x[i4] -= x[i3];
            x[i3] = x[i1] - t1;
            x[i1] += t1;

            i1 += n8;
            i2 += n8;
            i3 += n8;
            i4 += n8;

            t1 = x[i3] + x[i4];
            t2 = x[i3] - x[i4];

            t1 = -t1 * Math.SQRT1_2;
            t2 *= Math.SQRT1_2;

            st1 = x[i2];
            x[i4] = t1 + st1;
            x[i3] = t1 - st1;

            x[i2] = x[i1] - t2;
            x[i1] += t2;
          }
        else
          for (i0 = ix; i0 < n; i0 += id) {
            i1 = i0;
            i2 = i1 + n4;
            i3 = i2 + n4;
            i4 = i3 + n4;

            t1 = x[i3] + x[i4];
            x[i4] -= x[i3];

            x[i3] = x[i1] - t1;
            x[i1] += t1;
          }

        ix = (id << 1) - n2;
        id = id << 2;
      } while (ix < n);

      e = TWO_PI / n2;

      for (let j = 1; j < n8; j++) {
        a = j * e;
        ss1 = Math.sin(a);
        cc1 = Math.cos(a);

        cc3 = 4 * cc1 * (cc1 * cc1 - 0.75);
        ss3 = 4 * ss1 * (0.75 - ss1 * ss1);

        ix = 0;
        id = n2 << 1;
        do {
          for (i0 = ix; i0 < n; i0 += id) {
            i1 = i0 + j;
            i2 = i1 + n4;
            i3 = i2 + n4;
            i4 = i3 + n4;

            i5 = i0 + n4 - j;
            i6 = i5 + n4;
            i7 = i6 + n4;
            i8 = i7 + n4;

            t2 = x[i7] * cc1 - x[i3] * ss1;
            t1 = x[i7] * ss1 + x[i3] * cc1;

            t4 = x[i8] * cc3 - x[i4] * ss3;
            t3 = x[i8] * ss3 + x[i4] * cc3;

            st1 = t2 - t4;
            t2 += t4;
            t4 = st1;

            x[i8] = t2 + x[i6];
            x[i3] = t2 - x[i6];

            st1 = t3 - t1;
            t1 += t3;
            t3 = st1;

            x[i4] = t3 + x[i2];
            x[i7] = t3 - x[i2];

            x[i6] = x[i1] - t1;
            x[i1] += t1;

            x[i2] = t4 + x[i5];
            x[i5] -= t4;
          }

          ix = (id << 1) - n2;
          id = id << 2;
        } while (ix < n);
      }
    }

    while (--i) {
      rval = x[i];
      ival = x[n - i - 1];
      mag = bSi * sqrt(rval * rval + ival * ival);

      if (mag > this.peak) {
        this.peakBand = i;
        this.peak = mag;
      }

      spectrum[i] = mag;
    }

    spectrum[0] = bSi * x[0];

    return spectrum;
  }
}

export default class TheAnalyzer {
  private blocksPerNSeconds: number;
  private blocksPerMMilliSeconds: number;
  private wavData: WavData;
  public sampleRate: SampleRateValues;

  private static readonly N_SECONDS_TO_CHECK = 10;
  private static readonly M_MILLISECONDS_TO_CHECK = 300;

  private static readonly COMPRESSION_RATE = 16;
  private static readonly MAX_16_INT_VALUE = Math.pow(2, 15) - 1;
  private static readonly RMS_GETTING_T = 1;

  public static readonly RESONANCE = Math.SQRT2;

  public static readonly DEFAULT_SPECTRUM_OPTIONS: SpectrumOptions = {
    windowSize: 8192,
    delayBetweenOperations: 20,
    overlap: 0,
    shouldUseWindowFunction: false,
  };

  public readonly DEFAULT_RMS_OPTIONS_FOR_THIS_SAMPLE_RATE: RMSOptions;

  constructor(buffer: Buffer) {
    this.wavData = { compressionRate: TheAnalyzer.COMPRESSION_RATE };

    this.wavData.headers = this.readHeaders(buffer);

    this.sampleRate = this.wavData.headers.sampleRate;
    this.DEFAULT_RMS_OPTIONS_FOR_THIS_SAMPLE_RATE = {
      b: {
        lp: new Filter(100, 'lp', this.sampleRate),
      },
      lm: {
        lp: new Filter(2000, 'lp', this.sampleRate),
        hp: new Filter(100, 'hp', this.sampleRate),
      },
      hm: {
        lp: new Filter(10000, 'lp', this.sampleRate),
        hp: new Filter(2000, 'hp', this.sampleRate),
      },
      h: {
        hp: new Filter(10000, 'hp', this.sampleRate),
      },
    };

    this.wavData.compressedChannels = TheAnalyzer.findValuesInChannels(
      buffer.slice(44, buffer.length),
      this.wavData.headers.blockAlign,
      this.wavData.compressionRate,
    );

    this.wavData.duration =
      (this.wavData.compressedChannels.left.length * this.wavData.compressionRate) / this.wavData.headers.sampleRate;

    const blocksPerSecondInASingleChannel =
      this.wavData.headers.byteRate / (this.wavData.headers.blockAlign * this.wavData.compressionRate);
    this.blocksPerNSeconds = Math.ceil(blocksPerSecondInASingleChannel * TheAnalyzer.N_SECONDS_TO_CHECK);
    this.blocksPerMMilliSeconds = Math.ceil(
      (blocksPerSecondInASingleChannel * TheAnalyzer.M_MILLISECONDS_TO_CHECK) / 1000,
    );

    const borders = this.findTheLoudestSegmentBorders();

    const channels = TheAnalyzer.findValuesInChannels(
      buffer.slice(44, buffer.length),
      this.wavData.headers.blockAlign,
      1,
      borders.start * this.wavData.headers.blockAlign,
      borders.end * this.wavData.headers.blockAlign,
    );

    this.wavData.theLoudestSegment = { borders, channels };
  }

  private readHeaders(buffer: Buffer): Headers {
    const riff = buffer.slice(0, 4);
    if (riff.toString() !== 'RIFF') throw new Error('this is not wav file');

    const channelsNumber = buffer.readUInt16LE(22);
    if (channelsNumber !== 2) throw new Error("this wav file doesn't have 2 channels");

    const sampleRate = buffer.readUInt32LE(24);
    if (sampleRate !== 44100 && sampleRate !== 48000)
      throw new Error("this wav file doesn't have 44100 or 48000 sample rate");

    const byteRate = buffer.readUInt32LE(28);

    const blockAlign = buffer.readUInt16LE(32);
    if (blockAlign !== 4) throw new Error("this wav file doesn't have 4 bytes per sample");

    const bitsPerSample = buffer.readUInt16LE(34);
    if (bitsPerSample !== 16) throw new Error("this wav file doesn't have 16 bits per sample");

    return {
      channelsNumber,
      sampleRate,
      byteRate,
      blockAlign,
      bitsPerSample,
    };
  }

  private static findValuesInChannels(
    buffer: Buffer,
    blockAlign: number,
    compressionRate: number,
    start?: number,
    end?: number,
  ): Channels {
    const result = { left: [] as number[], right: [] as number[] };
    let i = start ?? 0;
    const _end = (end ?? buffer.length) - 4;
    while (i < _end) {
      result.left.push(buffer.readInt16LE(i) / TheAnalyzer.MAX_16_INT_VALUE);
      result.right.push(buffer.readInt16LE(i + 2) / TheAnalyzer.MAX_16_INT_VALUE);
      i += blockAlign * compressionRate;
    }
    return {
      left: new Float32Array(result.left),
      right: new Float32Array(result.right),
    };
  }

  private findTheLoudestSegmentBorders(): AudioSegment {
    if (!this.wavData.compressedChannels) throw new Error('wavData.compressedChannels not defined');
    if (!this.wavData.headers) throw new Error('wavData.headers not defined');
    if (!this.wavData.headers.sampleRate) throw new Error('wavData.headers.sampleRate not defined');
    const theLoudest = {
      index: 0,
      loudness: 0,
    };
    let loudnessValue = 0;
    for (let j = 0; j < this.blocksPerNSeconds; j++) {
      const channelsSum = (this.wavData.compressedChannels.left[j] + this.wavData.compressedChannels.right[j]) / 2;
      loudnessValue += Math.pow(channelsSum, 2) / this.blocksPerNSeconds;
    }
    theLoudest.loudness = loudnessValue;
    theLoudest.index = 0;

    for (let i = 0; i <= this.wavData.compressedChannels.left.length - this.blocksPerNSeconds; i++) {
      let channelsSum = (this.wavData.compressedChannels.left[i] + this.wavData.compressedChannels.right[i]) / 2;
      loudnessValue -= Math.pow(channelsSum, 2) / this.blocksPerNSeconds;
      channelsSum =
        (this.wavData.compressedChannels.left[i + this.blocksPerNSeconds + 1] +
          this.wavData.compressedChannels.right[i + this.blocksPerNSeconds + 1]) /
        2;
      loudnessValue += Math.pow(channelsSum, 2) / this.blocksPerNSeconds;
      if (loudnessValue > theLoudest.loudness) {
        theLoudest.loudness = loudnessValue;
        theLoudest.index = i;
      }
    }
    const theLoudestSegmentTrueStart = theLoudest.index * TheAnalyzer.COMPRESSION_RATE;
    return {
      start: theLoudestSegmentTrueStart,
      end: theLoudestSegmentTrueStart + TheAnalyzer.N_SECONDS_TO_CHECK * this.wavData.headers.sampleRate,
    };
  }

  private async getRmsInTheLoudestSegmentAsync(
    ampsArray: Float32Array,
    callback: (result: IntervalAndList) => {
      bandTitle: BandTitles;
      value: RMSValue;
    },
    bandTitle: BandTitles,
    otherOptions?: OtherOptions,
  ) {
    if (!this.wavData.theLoudestSegment) throw new Error('wavData.theLoudestSegment not defined');
    if (!this.wavData.theLoudestSegment.borders) throw new Error('wavData.theLoudestSegment.borders not defined');
    const segmentRmsDbValues: number[] = [];
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    const end = ampsArray.length - this.blocksPerMMilliSeconds;
    const cycleSum = otherOptions?.useFastMode
      ? Math.floor(TheAnalyzer.RMS_GETTING_T * this.blocksPerMMilliSeconds)
      : 1;
    const calculateRMSAsync = async (
      i: number,
    ): Promise<{
      bandTitle: BandTitles;
      value: RMSValue;
    }> =>
      new Promise<{
        bandTitle: BandTitles;
        value: RMSValue;
      }>(resolve => {
        if (i < end)
          setTimeout(() => {
            let index = i;
            for (; index < i + 3000; index++) {
              let segmentRms = 0;
              if (index > end) break;
              for (let j = 0; j < this.blocksPerMMilliSeconds; j++) {
                let lc = ampsArray[i + j];
                lc = lc > 1 ? 1 : lc < -1 ? -1 : lc;
                const lc2 = lc * lc;
                const lc2DivN = lc2 / this.blocksPerMMilliSeconds;
                segmentRms += lc2DivN;
              }
              segmentRms = Math.sqrt(segmentRms);
              const dB = Number((20 * Math.log10(segmentRms)).toFixed(2));
              if (dB > max) max = dB;
              else if (dB < min) min = dB;
              segmentRmsDbValues.push(dB);
            }
            if (otherOptions?.onLoading) otherOptions?.onLoading({ bandTitle, progress: index / end });
            return resolve(calculateRMSAsync(index + cycleSum));
          }, 0);
        else {
          const results = { interval: { min, max }, list: segmentRmsDbValues };
          if (otherOptions?.onLoading) otherOptions?.onLoading({ bandTitle, progress: 1 });
          return resolve(callback(results));
        }
      });
    return calculateRMSAsync(0);
  }

  private static processSignal(signal: Float32Array, band: Band) {
    if (band.hp && band.lp) return band.hp.process(band.lp.process(band.hp.process(band.lp.process(signal))));
    if (band.hp) return band.hp.process(band.hp.process(signal));
    if (band.lp) return band.lp.process(band.lp.process(signal));
    return signal;
  }

  private static arrayToRMSValue(
    intervalAndList: IntervalAndList,
    textBand: {
      from: string | number;
      to: string | number;
    },
  ): RMSValue {
    const sortedList = intervalAndList.list.sort((a, b) => a - b);
    const min = sortedList[Math.floor(0.95 * sortedList.length)];
    const max = sortedList[Math.floor(0.99 * sortedList.length)];
    return { interval: { min, max }, list: intervalAndList.list, textBand };
  }

  public async getRMSAsync(
    bands: RMSOptions = this.DEFAULT_RMS_OPTIONS_FOR_THIS_SAMPLE_RATE,
    options?: OtherOptions,
  ): Promise<RMSValues> {
    if (!this.wavData.theLoudestSegment) throw new Error('wavData.theLoudestSegment not defined');

    const channelsData = this.wavData.theLoudestSegment.channels.left;

    const calculateAll = () =>
      this.getRmsInTheLoudestSegmentAsync(
        channelsData,
        (res: IntervalAndList) => {
          return {
            bandTitle: 'all',
            value: TheAnalyzer.arrayToRMSValue(res, {
              from: 0,
              to: 'max',
            }),
          };
        },
        'all',
        options,
      );

    const calculateB = () =>
      this.getRmsInTheLoudestSegmentAsync(
        TheAnalyzer.processSignal(channelsData, bands.b),
        (res: IntervalAndList) => {
          return {
            bandTitle: 'b',
            value: TheAnalyzer.arrayToRMSValue(res, {
              from: 0,
              to: bands.b.lp.getCutoff(),
            }),
          };
        },
        'b',
        options,
      );

    const calculateLM = () =>
      this.getRmsInTheLoudestSegmentAsync(
        TheAnalyzer.processSignal(channelsData, bands.lm),
        (res: IntervalAndList) => {
          return {
            bandTitle: 'lm',
            value: TheAnalyzer.arrayToRMSValue(res, {
              from: bands.lm.hp.getCutoff(),
              to: bands.lm.lp.getCutoff(),
            }),
          };
        },
        'lm',
        options,
      );

    const calculateHM = () =>
      this.getRmsInTheLoudestSegmentAsync(
        TheAnalyzer.processSignal(channelsData, bands.hm),
        (res: IntervalAndList) => {
          return {
            bandTitle: 'hm',
            value: TheAnalyzer.arrayToRMSValue(res, {
              from: bands.hm.hp.getCutoff(),
              to: bands.hm.lp.getCutoff(),
            }),
          };
        },
        'hm',
        options,
      );

    const calculateH = () =>
      this.getRmsInTheLoudestSegmentAsync(
        TheAnalyzer.processSignal(channelsData, bands.h),
        (res: IntervalAndList) => {
          return {
            bandTitle: 'h',
            value: TheAnalyzer.arrayToRMSValue(res, {
              from: bands.h.hp.getCutoff(),
              to: 'max',
            }),
          };
        },
        'h',
        options,
      );

    return Promise.all([calculateAll(), calculateB(), calculateLM(), calculateHM(), calculateH()]).then(r => {
      const result = {} as RMSValues;
      r.forEach(v => {
        result[v.bandTitle] = v.value;
      });
      return result;
    });
  }

  public async getSpectrum(
    spectrumOptions: SpectrumOptions = TheAnalyzer.DEFAULT_SPECTRUM_OPTIONS,
  ): Promise<SpectrumValues> {
    if (!this.wavData.theLoudestSegment) throw new Error('wavData.theLoudestSegment not defined');
    const hann = (arr: Float32Array) => {
      return arr.map((el, idx) => el * Math.pow(Math.cos((Math.PI * idx) / arr.length), 2));
    };
    const result = [];
    const rfftMonster = new RFFT(spectrumOptions.windowSize);
    let offset = 0;
    const channelsData = this.wavData.theLoudestSegment.channels.left;
    while (offset + spectrumOptions.windowSize < channelsData.length) {
      const segment = channelsData.slice(offset, offset + spectrumOptions.windowSize);
      const spectrum = spectrumOptions.shouldUseWindowFunction
        ? hann(rfftMonster.forward(segment))
        : rfftMonster.forward(segment);
      result.push(new Float32Array(spectrum.map(el => (el <= 0 ? 0 : el))));
      offset += Math.floor(
        ((this.sampleRate * spectrumOptions.delayBetweenOperations) / 1000) * (1 - spectrumOptions.overlap),
      );
    }
    return {
      spectrum: result,
      lengthX: result.length,
      lengthY: spectrumOptions.windowSize / 2,
      nyquistFrequency: this.sampleRate / 2,
    };
  }

  public getTheLoudestSegmentTime(): AudioSegment {
    if (!this.wavData.theLoudestSegment) throw new Error('wavData.theLoudestSegment not defined');
    const start = this.wavData.theLoudestSegment.borders.start / this.sampleRate;
    const end = this.wavData.theLoudestSegment.borders.end / this.sampleRate;
    return { start, end };
  }
}
