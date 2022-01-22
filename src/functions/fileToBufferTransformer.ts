import { TypedBuffer } from '@/types';
export default async function (file: File): Promise<TypedBuffer> {
  return {
    type: file.type,
    buffer: new Uint8Array(await file.arrayBuffer()),
  };
}
