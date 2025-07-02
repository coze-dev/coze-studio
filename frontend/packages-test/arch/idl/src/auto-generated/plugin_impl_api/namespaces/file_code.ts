/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface CsvDataAnalysisRequest {
  file_url?: string;
  prompt?: string;
  model_name?: string;
}

export interface CsvDataAnalysisResponse {
  code?: number;
  msg?: string;
  data?: string;
  type_for_model?: number;
}
/* eslint-enable */
