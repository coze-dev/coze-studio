/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface RecallDatasetRequest {
  question: string;
}

export interface RecallDatasetResponse {
  slices?: Array<string>;
  code?: string;
  msg?: string;
}
/* eslint-enable */
