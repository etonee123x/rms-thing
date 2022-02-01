import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { Buffer } from 'buffer';

export const convertSingleFile = async (file: File) => {
  const ffmpeg = createFFmpeg();
  await ffmpeg.load();
  ffmpeg.FS('writeFile', 'test.mp3', await fetchFile(file));
  await ffmpeg.run('-i', 'test.mp3', 'test.wav');
  const wavData = ffmpeg.FS('readFile', 'test.wav');
  return Buffer.from(wavData);
};
