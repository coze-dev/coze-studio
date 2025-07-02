/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface BenefitInfo {
  benefit_id?: string;
  benefit_type?: string;
  active_mode?: string;
  started_at?: Int64;
  ended_at?: Int64;
  duration?: number;
  limit?: Int64;
  status?: string;
  entity_type?: string;
  entity_id?: string;
  trigger_unit?: string;
  trigger_time?: Int64;
}

export interface BillBusinessData {
  task_infos?: Array<BillTaskInfo>;
  total?: number;
}

export interface BillTaskInfo {
  task_id?: string;
  status?: string;
  file_urls?: Array<string>;
  /** 过期时间，Unix 时间戳 */
  expires_at?: Int64;
  /** 创建时间，Unix 时间戳 */
  created_at?: Int64;
  /** 开始时间，Unix 时间戳 */
  started_at?: Int64;
  /** 结束时间，Unix 时间戳 */
  ended_at?: Int64;
}

export interface CreateBenefitLimitationData {
  benefit_info?: BenefitInfo;
}

export interface CreateBenefitLimitationRequest {
  entity_type?: string;
  entity_id?: string;
  benefit_info?: BenefitInfo;
}

export interface CreateBenefitLimitationResponse {
  code?: number;
  msg?: string;
  data?: CreateBenefitLimitationData;
}

export interface CreateBillDownloadTaskRequest {
  /** 开始时间，时间戳 */
  started_at?: Int64;
  /** 结束时间，时间戳 */
  ended_at?: Int64;
}

export interface CreateBillDownloadTaskResponse {
  code?: number;
  msg?: string;
  data?: BillTaskInfo;
}

export interface ListBenefitLimitationData {
  benefit_infos?: Array<BenefitInfo>;
  has_more?: boolean;
  page_token?: string;
}

export interface ListBenefitLimitationRequest {
  entity_type?: string;
  entity_id?: string;
  benefit_type?: string;
  status?: string;
  page_token?: string;
  page_size?: number;
}

export interface ListBenefitLimitationResponse {
  code?: number;
  msg?: string;
  data?: ListBenefitLimitationData;
}

export interface ListBillDownloadTaskRequest {
  task_ids?: Array<Int64>;
  page_num?: number;
  page_size?: number;
}

export interface ListBillDownloadTaskResponse {
  code?: number;
  msg?: string;
  data?: BillBusinessData;
}

export interface UpdateBenefitLimitationRequest {
  benefit_id?: string;
  active_mode?: string;
  started_at?: Int64;
  ended_at?: Int64;
  duration?: number;
  limit?: Int64;
  status?: string;
  trigger_unit?: string;
  trigger_time?: Int64;
}

export interface UpdateBenefitLimitationResponse {
  code?: number;
  msg?: string;
}
/* eslint-enable */
