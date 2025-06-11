/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface GenMusicRequest {
  prompt: string;
}

export interface GenMusicResponse {
  music_urls?: Array<string>;
  code?: number;
  msg?: string;
}
/* eslint-enable */
