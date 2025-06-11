/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum DeleteType {
  DeleteMessage = 1,
  DeleteConversation = 2,
}

export interface GetLongMemoryData {
  memory?: Array<LongMemoryInfo>;
}

export interface GetShortMemoryData {
  memory?: Array<ShortMemoryInfo>;
}

export interface LongMemory {
  question?: string;
  answer?: string;
}

export interface LongMemoryInfo {
  question?: string;
  answer?: string;
  score?: number;
}

export interface ShortMemoryInfo {
  type?: number;
  content?: string;
}
/* eslint-enable */
