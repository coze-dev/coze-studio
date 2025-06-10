/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as report_common from './report_common';

export type Int64 = string | number;

export interface GetReportMetaRequest {}

export interface GetReportMetaResponse {
  code: number;
  message: string;
  data?: ReportMetaData;
}

export interface ReportDetail {
  description?: string;
  /** uri */
  images?: Array<string>;
  reason_codes?: Array<number>;
}

export interface ReportMetaData {
  report_reasons?: Array<ReportReason>;
}

export interface ReportReason {
  reason_code: number;
  starling_key: string;
}

export interface ReportSubmitRequest {
  object_type?: report_common.ReportObjectType;
  object_id?: string;
  detail?: ReportDetail;
  Cookie?: string;
}

export interface ReportSubmitResponse {
  code: number;
  message: string;
}
/* eslint-enable */
