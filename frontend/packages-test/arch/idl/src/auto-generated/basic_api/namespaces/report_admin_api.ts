/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as report_common from './report_common';
import * as flow_platform_audit_common from './flow_platform_audit_common';

export type Int64 = string | number;

export interface GetReportTimesData {
  report_times_datas?: Record<Int64, ReportTimesData>;
}

export interface GetReportTimesRequest {
  object_id_list?: Array<string>;
  object_type?: report_common.ReportObjectType;
}

export interface GetReportTimesResponse {
  code: number;
  message: string;
  data?: GetReportTimesData;
}

export interface ReportData {
  object_id: string;
  object_type: report_common.ReportObjectType;
  reason_codes_str: Array<string>;
  report_uid?: string;
  report_id?: string;
  report_user_name?: string;
  report_time?: string;
  report_object_name?: string;
  report_task_id?: string;
  report_status?: report_common.ReportEventStatus;
  audit_status?: flow_platform_audit_common.AuditStatus;
}

export interface ReportQueryData {
  report_datas?: Array<ReportData>;
  total_count?: number;
}

export interface ReportQueryRequest {
  object_id_list?: Array<string>;
  object_type?: report_common.ReportObjectType;
  report_time_begin?: Int64;
  report_time_end?: Int64;
  report_uid?: Int64;
  page_num?: number;
  page_size?: number;
}

export interface ReportQueryResponse {
  code: number;
  message: string;
  data?: ReportQueryData;
}

export interface ReportTimesData {
  total_report_times?: number;
  current_report_times?: number;
}
/* eslint-enable */
