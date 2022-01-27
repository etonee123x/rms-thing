import { Buffer } from 'buffer';

interface IWAVHeaders {
  channelsNumber: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;
  dataSize: number;
}

interface Time {
  minutes: string;
  seconds: string;
}

interface Interval {
  min: number;
  max: number;
}

export interface Results {
  audio_duration: Time;
  the_loudest_segment: {
    start: Time;
    end: Time;
  };
  rms_values: {
    rms_interval: Interval;
    confidence_interval: Interval | null;
    rms_array: number[];
  };
}

export default class RMSHandler {
  public theBuffer: Buffer = Buffer.from([]);
  private blocksNumber?: number;
  private headers: IWAVHeaders = {} as IWAVHeaders;
  private channels: { left: number[]; right: number[] } = {
    left: [],
    right: [],
  };

  private blocksPerNSeconds?: number;
  private blocksPerMMilliSeconds?: number;
  private theLoudestSegment?: { start: number; end: number };
  private pointsNumber?: number;
  private segmentRmsDbValues: number[] = [];
  private results!: Results;

  static readonly N_SECONDS_TO_CHECK = 10;
  private static readonly M_MILLISECONDS_TO_CHECK = 300;
  private static readonly K_BLOCKS = Math.pow(2, 3);

  public fromBuffer(buffer: Buffer | Uint8Array): RMSHandler {
    this.theBuffer = Buffer.from(buffer);
    return this;
  }

  private readHeaders() {
    const riff = this.theBuffer.slice(0, 4);
    if (riff.toString() !== 'RIFF') throw new Error('this is not wav file');
    this.headers.channelsNumber = this.theBuffer.readUInt16LE(22);
    if (this.headers.channelsNumber !== 2)
      throw new Error("this wav file doesn't have 2 channels");
    this.headers.sampleRate = this.theBuffer.readUInt32LE(24);
    this.headers.byteRate = this.theBuffer.readUInt32LE(28);
    this.headers.blockAlign = this.theBuffer.readUInt16LE(32);
    this.headers.bitsPerSample = this.theBuffer.readUInt16LE(34);
    this.theBuffer = this.theBuffer.slice(44, this.theBuffer.length);
    this.headers.dataSize = this.theBuffer.length;
  }

  private findBlockLengths() {
    const blocksPerSecondInASingleChannel =
      this.headers.byteRate / (this.headers.blockAlign * RMSHandler.K_BLOCKS);
    this.blocksPerNSeconds = Math.floor(
      blocksPerSecondInASingleChannel * RMSHandler.N_SECONDS_TO_CHECK,
    );
    this.blocksPerMMilliSeconds = Math.floor(
      (blocksPerSecondInASingleChannel * RMSHandler.M_MILLISECONDS_TO_CHECK) /
        1000,
    );
  }

  private parseWavToChannels() {
    if (this.headers.bitsPerSample === 16 && this.blocksNumber)
      for (let i = 0; i < this.blocksNumber; i += RMSHandler.K_BLOCKS) {
        const blockData = this.theBuffer.slice(
          i * this.headers.blockAlign,
          (i + 1) * this.headers.blockAlign,
        );
        this.channels.left.push(blockData.readInt16LE(0));
        this.channels.right.push(blockData.readInt16LE(2));
      }
    else if (this.headers.bitsPerSample === 32 && this.blocksNumber)
      for (let i = 1; i < this.blocksNumber; i += RMSHandler.K_BLOCKS) {
        const blockData = this.theBuffer.slice(
          i * this.headers.blockAlign,
          (i + 1) * this.headers.blockAlign,
        );
        this.channels.left.push(blockData.readInt32LE(0));
        this.channels.right.push(blockData.readInt32LE(4));
      }
    this.pointsNumber = this.channels.left.length;
  }

  private findTheLoudestSegment() {
    if (!this.blocksPerNSeconds)
      throw new Error('blocksPerNSeconds not defined');
    const theLoudest = {
      index: 0,
      loudness: 0,
    };
    let loudnessValue = 0;
    for (let j = 0; j < this.blocksPerNSeconds; j++) {
      const channelsSum = (this.channels.left[j] + this.channels.right[j]) / 2;
      loudnessValue += Math.pow(channelsSum, 2) / this.blocksPerNSeconds;
    }
    theLoudest.loudness = loudnessValue;
    theLoudest.index = 0;

    for (
      let i = 0;
      i <= this.channels.left.length - this.blocksPerNSeconds;
      i++
    ) {
      let channelsSum = (this.channels.left[i] + this.channels.right[i]) / 2;
      loudnessValue -= Math.pow(channelsSum, 2) / this.blocksPerNSeconds;
      channelsSum =
        (this.channels.left[i + this.blocksPerNSeconds + 1] +
          this.channels.right[i + this.blocksPerNSeconds + 1]) /
        2;
      loudnessValue += Math.pow(channelsSum, 2) / this.blocksPerNSeconds;
      if (loudnessValue > theLoudest.loudness) {
        theLoudest.loudness = loudnessValue;
        theLoudest.index = i;
      }
    }
    this.theLoudestSegment = {
      start: theLoudest.index,
      end: theLoudest.index + this.blocksPerNSeconds,
    };
    return theLoudest;
  }

  private getRmsInTheLoudestSegment() {
    if (!this.theLoudestSegment)
      throw new Error('theLoudestSegment not defined');
    if (!this.blocksPerMMilliSeconds)
      throw new Error('blocksPerMMilliSeconds not defined');
    this.segmentRmsDbValues = [];
    for (
      let i = this.theLoudestSegment.start;
      i < this.theLoudestSegment.end - this.blocksPerMMilliSeconds;
      i++
    ) {
      let segmentRms = 0;
      for (let j = 0; j < this.blocksPerMMilliSeconds; j++) {
        const lc = this.channels.left[i + j];
        const rc = this.channels.right[i + j];
        const semiSum = (lc + rc) / 2;
        const semiSumPow2 = semiSum * semiSum;
        const semiSumPow2DivN = semiSumPow2 / this.blocksPerMMilliSeconds;
        segmentRms += semiSumPow2DivN;
      }
      segmentRms = Math.sqrt(segmentRms) * Math.sqrt(2);
      const dB =
        20 *
        Math.log10(segmentRms / Math.pow(2, this.headers.bitsPerSample - 1));
      this.segmentRmsDbValues.push(Number(dB.toFixed(2)));
    }
  }

  public formInfo() {
    console.time('timer');
    this.readHeaders();
    console.timeLog('timer', 'red headers');
    this.blocksNumber = this.headers.dataSize / this.headers.blockAlign;
    this.parseWavToChannels();
    console.timeLog('timer', 'parsed channels');
    this.findBlockLengths();
    this.findTheLoudestSegment();
    console.timeLog('timer', 'found the loudest segment');
    this.getRmsInTheLoudestSegment();
    console.timeLog('timer', 'found RMS');
    const duration = Math.floor(this.headers.dataSize / this.headers.byteRate);
    const audioDuration = {
      minutes: RMSHandler.toMinutes(duration),
      seconds: RMSHandler.toSeconds(duration),
    };
    if (!this.theLoudestSegment)
      throw new Error('theLoudestSegment not defined');
    if (!this.pointsNumber) throw new Error('pointsNumber not defined');
    const theLoudestSegment = {
      start: {
        minutes: RMSHandler.toMinutes(
          (this.theLoudestSegment.start / this.pointsNumber) * duration,
        ),
        seconds: RMSHandler.toSeconds(
          (this.theLoudestSegment.start / this.pointsNumber) * duration,
        ),
      },
      end: {
        minutes: RMSHandler.toMinutes(
          (this.theLoudestSegment.end / this.pointsNumber) * duration,
        ),
        seconds: RMSHandler.toSeconds(
          (this.theLoudestSegment.end / this.pointsNumber) * duration,
        ),
      },
    };
    const rmsIntervals = {
      min: Math.min(...this.segmentRmsDbValues),
      max: Math.max(...this.segmentRmsDbValues),
    };
    const confidenceIntervals = RMSHandler.getIntervals(
      this.segmentRmsDbValues,
    );
    this.results = {
      audio_duration: audioDuration,
      the_loudest_segment: theLoudestSegment,
      rms_values: {
        rms_interval: rmsIntervals,
        confidence_interval: confidenceIntervals,
        rms_array: this.segmentRmsDbValues,
      },
    };
    return this.results;
  }

  private static toMinutes(time: number): string {
    return Math.floor(time / 60).toString();
  }

  private static toSeconds(time: number): string {
    const result = Math.floor(time) % 60;
    return result > 9 ? `${result}` : `0${result}`;
  }

  private static getIntervals(arr: number[]) {
    const SIGMAS = 1;

    let avgValue = 0;
    for (let i = 0; i < arr.length; i++) avgValue += arr[i] / arr.length;
    let d = 0;
    for (let i = 0; i < arr.length; i++)
      d += ((arr[i] - avgValue) * (arr[i] - avgValue)) / arr.length;
    const sigma = Math.sqrt(d);
    if (
      avgValue - SIGMAS * sigma < Math.min(...arr) ||
      avgValue + SIGMAS * sigma > Math.max(...arr)
    )
      return null;
    return {
      min: Math.floor((avgValue - SIGMAS * sigma) * 100) / 100,
      max: Math.floor((avgValue + SIGMAS * sigma) * 100) / 100,
    };
  }
}
