/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface ChunkData {
  chunks?: Array<string>;
}

export interface FileChunkingRequest {
  file_url?: Array<string>;
}

export interface FileChunkingResponse {
  code?: number;
  msg?: string;
  data?: Array<ChunkData>;
}
/* eslint-enable */
