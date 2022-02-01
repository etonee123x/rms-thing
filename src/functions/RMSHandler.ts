/*
  Works only with Int16 2channels 44100kHz wav files
*/
import { Buffer } from 'buffer';

interface Headers {
  channelsNumber: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;
}

interface Channels {
  left: Float32Array;
  right: Float32Array;
}
interface IntervalAndList {
  interval: {
    min: number;
    max: number;
  };
  list: number[];
}
interface RMSValues {
  all?: IntervalAndList;
  b?: IntervalAndList;
  lm?: IntervalAndList;
  hm?: IntervalAndList;
  h?: IntervalAndList;
}

interface AudioSegment {
  start: number;
  end: number;
}

interface TheLoudestSegment {
  borders?: AudioSegment;
  channels?: Channels;
  compressedChannels?: Channels;
  rmsValues?: RMSValues;
}

interface WavData {
  headers?: Headers;
  compressionRate: number;
  compressedChannels?: Channels;
  duration?: number;
  theLoudestSegment?: TheLoudestSegment;
}

export interface Results {
  the_loudest_segment: AudioSegment;
  rms: RMSValues;
  time_to_process?: number;
}

class Filter {
  private outPrev = 0;
  private outPrevPrev = 0;
  private static readonly SAMPLE_RATE = 44100;
  private c!: number;
  private a1!: number;
  private a2!: number;
  private a3!: number;
  private b1!: number;
  private b2!: number;

  constructor(cutoff: number, resonance: number, isLowPass = true) {
    isLowPass ? this.setLPParams(cutoff, resonance) : this.setHPParams(cutoff, resonance);
  }

  private setLPParams(cutoff: number, resonance: number) {
    this.c = 1.0 / Math.tan((Math.PI * cutoff) / Filter.SAMPLE_RATE);

    this.a1 = 1.0 / (1.0 + resonance * this.c + this.c * this.c);
    this.a2 = 2 * this.a1;
    this.a3 = this.a1;
    this.b1 = 2.0 * (1.0 - this.c * this.c) * this.a1;
    this.b2 = (1.0 - resonance * this.c + this.c * this.c) * this.a1;
  }

  private setHPParams(cutoff: number, resonance: number) {
    this.c = Math.tan((Math.PI * cutoff) / Filter.SAMPLE_RATE);

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
}

interface Band {
  lp?: Filter;
  hp?: Filter;
}

interface Freqs {
  b: Band;
  lm: Band;
  hm: Band;
  h: Band;
}

export default class RMSHandler {
  private timeToProcess: number;
  private blocksPerNSeconds?: number;
  private blocksPerMMilliSeconds?: number;
  private wavData: WavData;
  private bands: Freqs = {
    b: {
      lp: new Filter(100, RMSHandler.RESONANCE),
    },
    lm: {
      lp: new Filter(2000, RMSHandler.RESONANCE),
      hp: new Filter(100, RMSHandler.RESONANCE, false),
    },
    hm: {
      lp: new Filter(10000, RMSHandler.RESONANCE),
      hp: new Filter(2000, RMSHandler.RESONANCE, false),
    },
    h: {
      hp: new Filter(10000, RMSHandler.RESONANCE, false),
    },
  };

  private static readonly N_SECONDS_TO_CHECK = 10;
  private static readonly M_MILLISECONDS_TO_CHECK = 300;
  private static readonly COMPRESSION_RATE = 32;
  private static readonly MAX_16_INT_VALUE = 32768;
  private static readonly RESONANCE = Math.sqrt(2);
  private static readonly RMS_GETTING_T = 0.1;

  constructor(buffer: Buffer) {
    const startTime = Date.now();
    console.time('timer');
    this.wavData = { compressionRate: RMSHandler.COMPRESSION_RATE };

    this.wavData.headers = this.readHeaders(buffer);
    console.timeLog('timer', 'red headers');

    this.wavData.compressedChannels = RMSHandler.findValuesInChannels(
      buffer.slice(44, buffer.length),
      this.wavData.headers.blockAlign,
      this.wavData.compressionRate,
    );
    console.timeLog('timer', 'found compressed channels values');

    this.wavData.duration =
      (this.wavData.compressedChannels.left.length * this.wavData.compressionRate) / this.wavData.headers.sampleRate;
    console.timeLog('timer', 'found duration');

    const blocksPerSecondInASingleChannel =
      this.wavData.headers.byteRate / (this.wavData.headers.blockAlign * this.wavData.compressionRate);
    this.blocksPerNSeconds = Math.ceil(blocksPerSecondInASingleChannel * RMSHandler.N_SECONDS_TO_CHECK);
    this.blocksPerMMilliSeconds = Math.ceil(
      (blocksPerSecondInASingleChannel * RMSHandler.M_MILLISECONDS_TO_CHECK) / 1000,
    );

    this.wavData.theLoudestSegment = {};

    this.wavData.theLoudestSegment.borders = this.findTheLoudestSegmentBorders();
    console.timeLog('timer', 'found the loudest segment borders');

    this.wavData.theLoudestSegment.channels = RMSHandler.findValuesInChannels(
      buffer.slice(44, buffer.length),
      this.wavData.headers.blockAlign,
      1,
      this.wavData.theLoudestSegment.borders.start * this.wavData.headers.blockAlign,
      this.wavData.theLoudestSegment.borders.end * this.wavData.headers.blockAlign,
    );

    this.wavData.theLoudestSegment.compressedChannels = RMSHandler.findValuesInChannels(
      buffer.slice(44, buffer.length),
      this.wavData.headers.blockAlign,
      this.wavData.compressionRate,
      this.wavData.theLoudestSegment.borders.start * this.wavData.headers.blockAlign,
      this.wavData.theLoudestSegment.borders.end * this.wavData.headers.blockAlign,
    );
    console.timeLog('timer', 'found the loudest segment channels values');

    this.wavData.theLoudestSegment.rmsValues = {};
    this.wavData.theLoudestSegment.rmsValues.all = RMSHandler.arrToIntervalAndList(
      this.getRmsInTheLoudestSegment(this.wavData.theLoudestSegment.channels.left),
    );
    console.timeLog('timer', 'found all RMS values in the loudest segment');

    this.wavData.theLoudestSegment.rmsValues.b = RMSHandler.arrToIntervalAndList(
      this.getRmsInTheLoudestSegment(
        RMSHandler.processSignal(this.wavData.theLoudestSegment.channels.left, this.bands.b),
      ),
    );
    console.timeLog('timer', 'found bass RMS values in the loudest segment');

    this.wavData.theLoudestSegment.rmsValues.lm = RMSHandler.arrToIntervalAndList(
      this.getRmsInTheLoudestSegment(
        RMSHandler.processSignal(this.wavData.theLoudestSegment.channels.left, this.bands.lm),
      ),
    );
    console.timeLog('timer', 'found low-mid RMS values in the loudest segment');

    this.wavData.theLoudestSegment.rmsValues.hm = RMSHandler.arrToIntervalAndList(
      this.getRmsInTheLoudestSegment(
        RMSHandler.processSignal(this.wavData.theLoudestSegment.channels.left, this.bands.hm),
      ),
    );
    console.timeLog('timer', 'found high-mid RMS values in the loudest segment');

    this.wavData.theLoudestSegment.rmsValues.h = RMSHandler.arrToIntervalAndList(
      this.getRmsInTheLoudestSegment(
        RMSHandler.processSignal(this.wavData.theLoudestSegment.channels.left, this.bands.h),
      ),
    );
    console.timeLog('timer', 'found high RMS values in the loudest segment');

    console.timeEnd('timer');
    const endTime = Date.now();
    this.timeToProcess = endTime - startTime;
  }

  private readHeaders(buffer: Buffer): Headers {
    const riff = buffer.slice(0, 4);
    if (riff.toString() !== 'RIFF') throw new Error('this is not wav file');

    const channelsNumber = buffer.readUInt16LE(22);
    if (channelsNumber !== 2) throw new Error("this wav file doesn't have 2 channels");

    const sampleRate = buffer.readUInt32LE(24);
    if (sampleRate !== 44100) throw new Error("this wav file doesn't have 44100 sample rate");

    const byteRate = buffer.readUInt32LE(28);
    if (byteRate !== 176400) throw new Error("this wav file doesn't have 176400 bytes per second");

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
      result.left.push(buffer.readInt16LE(i) / RMSHandler.MAX_16_INT_VALUE);
      result.right.push(buffer.readInt16LE(i + 2) / RMSHandler.MAX_16_INT_VALUE);
      i += blockAlign * compressionRate;
    }
    return {
      left: new Float32Array(result.left),
      right: new Float32Array(result.right),
    };
  }

  private findTheLoudestSegmentBorders(): AudioSegment {
    if (!this.blocksPerNSeconds) throw new Error('blocksPerNSeconds not defined');
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
    const theLoudestSegmentTrueStart = theLoudest.index * RMSHandler.COMPRESSION_RATE;
    return {
      start: theLoudestSegmentTrueStart,
      end: theLoudestSegmentTrueStart + RMSHandler.N_SECONDS_TO_CHECK * this.wavData.headers.sampleRate,
    };
  }

  private getRmsInTheLoudestSegment(ampsArray: Float32Array) {
    if (!this.wavData.theLoudestSegment) throw new Error('wavData.theLoudestSegment not defined');
    if (!this.wavData.theLoudestSegment.borders) throw new Error('wavData.theLoudestSegment.borders not defined');
    if (!this.blocksPerMMilliSeconds) throw new Error('blocksPerMMilliSeconds not defined');
    const segmentRmsDbValues: number[] = [];
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    for (
      let i = 0;
      i < ampsArray.length - this.blocksPerMMilliSeconds;
      i += Math.floor(RMSHandler.RMS_GETTING_T * this.blocksPerMMilliSeconds)
    ) {
      let segmentRms = 0;
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
    return { interval: { min, max }, list: segmentRmsDbValues };
  }

  private static compressArray(array: Float32Array, compressionRate = RMSHandler.COMPRESSION_RATE) {
    const result = [] as number[];
    for (let i = 0; i < array.length - compressionRate; i += compressionRate) result.push(array[i]);
    console.log(result.length);
    return new Float32Array(result);
  }

  private static processSignal(signal: Float32Array, band: Band) {
    if (band.hp && band.lp) {
      const bp1 = band.hp.process(band.lp.process(signal));
      const bp2 = band.hp.process(band.lp.process(bp1));
      return bp2;
    }
    if (band.hp) {
      const hp1 = band.hp.process(signal);
      const hp2 = band.hp.process(hp1);
      return hp2;
    }
    if (band.lp) {
      const lp1 = band.lp.process(signal);
      const lp2 = band.lp.process(lp1);
      return lp2;
    }
    return signal;
  }

  private static arrToIntervalAndList(intervalAndList: IntervalAndList): IntervalAndList {
    const sortedList = intervalAndList.list.sort((a, b) => a - b);
    const min = sortedList[Math.floor(0.95 * sortedList.length)];
    const max = sortedList[Math.floor(0.99 * sortedList.length)];
    return { interval: { min, max }, list: intervalAndList.list };
  }

  public getResults(): Results {
    if (!this.wavData.headers) throw new Error('wavData.theLoudestSegment.rmsValues not defined');
    if (!this.wavData.theLoudestSegment) throw new Error('wavData.theLoudestSegment not defined');
    if (!this.wavData.theLoudestSegment.rmsValues) throw new Error('wavData.theLoudestSegment.rmsValues not defined');
    if (!this.wavData.theLoudestSegment.borders) throw new Error('wavData.theLoudestSegment.rmsValues not defined');
    const start = this.wavData.theLoudestSegment.borders.start / this.wavData.headers.sampleRate;
    const end = this.wavData.theLoudestSegment.borders.end / this.wavData.headers.sampleRate;
    return {
      the_loudest_segment: { start, end },
      rms: this.wavData.theLoudestSegment.rmsValues,
      time_to_process: this.timeToProcess,
    };
  }
}
