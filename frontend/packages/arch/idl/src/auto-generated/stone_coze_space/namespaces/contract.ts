/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface ContractInfo {
  file_id?: string;
  holders?: Array<Holder>;
}

export interface GetContractCaseInfoRequest {
  case_no?: string;
}

export interface GetContractCaseInfoResponse {
  code?: Int64;
  msg?: string;
  data?: GetContractCaseInfoResponseData;
}

export interface GetContractCaseInfoResponseData {
  case_no?: string;
  title?: string;
  analysis?: string;
  judge_result?: string;
  judge_date?: string;
  court?: string;
  type?: string;
  judge_phase?: string;
  parties?: string;
  tail?: string;
}

export interface GetContractLawInfoRequest {
  law?: string;
  num?: string;
}

export interface GetContractLawInfoResponse {
  code?: Int64;
  msg?: string;
  data?: GetContractLawInfoResponseData;
}

export interface GetContractLawInfoResponseData {
  num?: string;
  law?: string;
  content?: string;
}

/** 持方 */
export interface Holder {
  /** 主体名称 */
  name?: string;
  /** 主体角色 */
  part?: string;
  /** 审查目的 */
  objectives?: Array<string>;
}

export interface PreGetContractInfoRequest {
  file_content?: Blob;
  task_id?: string;
  file_name?: string;
}

export interface PreGetContractInfoResponse {
  code?: Int64;
  msg?: string;
  data?: PreGetContractInfoResponseData;
}

export interface PreGetContractInfoResponseData {
  contract_info?: ContractInfo;
}
/* eslint-enable */
