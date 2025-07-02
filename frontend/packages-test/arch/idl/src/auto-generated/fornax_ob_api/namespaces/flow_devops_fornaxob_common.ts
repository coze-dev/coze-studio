/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum EnvType {
  Online = 0,
  BOE = 1,
  /** 废弃 */
  All = 2,
}

export enum OrderType {
  Unknown = 1,
  Desc = 2,
}

export enum PlatformType {
  /** 废弃 */
  Fornax = 0,
  Coze = 1,
  PSM = 2,
  Doubao = 3,
  Prompt = 4,
  PSMWithoutDoubao = 5,
  PromptWithoutDoubao = 6,
  SaasFornax = 7,
  SaasPrompt = 8,
  SaasEvaluator = 9,
  CozeProject = 10,
  CozeBot = 11,
  SaasEvalTarget = 12,
  SaasAll = 13,
}

export enum QueryOfflineType {
  ListTraces = 0,
  GetTrace = 1,
  GetTraceByLogID = 2,
  BatchGetTracesAdvanceInfo = 3,
  GetMetrics = 4,
  GetTagsOptions = 5,
  ListThreads = 6,
  GetThread = 7,
  GetThreadMeta = 8,
  ListAllSpans = 9,
  ListLLMSpans = 10,
  SearchTraceV3 = 11,
}

export enum SpanListType {
  RootSpan = 0,
  AllSpan = 1,
  LLMSpan = 2,
}

/** ValueType is used to represent any type of attribute value. */
export enum ValueType {
  Unknown = 1,
  Bool = 2,
  I32 = 3,
  I64 = 4,
  F64 = 5,
  String = 6,
}

export interface OrderBy {
  field_name?: string;
  order_type?: OrderType;
}

export interface QueryOfflineRequest {
  type: QueryOfflineType;
  body: string;
  'x-zti-token'?: string;
}

export interface QueryOfflineResponse {
  type: QueryOfflineType;
  body: string;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  code?: number;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  msg?: string;
}
/* eslint-enable */
