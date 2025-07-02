/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface AddBillRequest {
  /** 消费日期 */
  date: string;
  /** 消费类别 */
  category: string;
  /** 消费金额 */
  amount: number;
  /** 消费描述 */
  description: string;
}

export interface AddBillResponse {
  code?: number;
  msg?: string;
  id?: string;
  date?: string;
  show_app?: number;
}

export interface AnalyseBillRequest {
  sql: string;
}

export interface AnalyseBillResponse {
  code?: number;
  msg?: string;
  result?: string;
}

export interface AnalysisInfo {
  /** 消费月份 */
  expense_month: number;
  analysis_info?: Array<CategoryAnalysis>;
}

export interface AnalysisMonthBillRequest {
  /** 消费月份 */
  expense_month: string;
}

export interface AnalysisMonthBillResponse {
  code?: number;
  msg?: string;
  data?: AnalysisInfo;
}

export interface BillInfo {
  id: string;
  /** 消费日期 */
  expense_date: string;
  /** 消费类别 */
  category: string;
  /** 消费金额 */
  amount: number;
  /** 消费描述 */
  description: string;
}

export interface CategoryAnalysis {
  /** 消费类别 */
  category: string;
  /** 消费金额 */
  amount: number;
  /** 百分比分布 */
  percent: number;
}

export interface DeleteBillRequest {
  sql: string;
  force?: number;
}

export interface DeleteBillResponse {
  code?: number;
  msg?: string;
  date?: string;
}

export interface GetBillDetailRequest {
  id: string;
}

export interface GetBillDetailResponse {
  code?: number;
  msg?: string;
  data?: BillInfo;
}

export interface GetMonthBillData {
  /** 消费月份 */
  expense_month: number;
  /** 总支出 */
  totalAmount: number;
  bills?: Array<BillInfo>;
}

export interface GetMonthBillRequest {
  /** 消费月份 */
  expense_month: number;
}

export interface GetMonthBillResponse {
  code?: number;
  msg?: string;
  data?: GetMonthBillData;
}

export interface ModifyBillRequest {
  sql: string;
  force: number;
}

export interface ModifyBillResponse {
  code?: number;
  msg?: string;
  date?: string;
  id?: string;
}
/* eslint-enable */
