/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

/** 聚合维度 */
export enum AggregateDimension {
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
  Quarterly = 4,
  Yearly = 5,
}

export enum APISource {
  OpenAPI = 1,
  Coze = 2,
}

export enum CozeVersion {
  Inhouse = 1,
  Release = 2,
  Ppe = 3,
}

export enum DetailsType {
  api = 1,
  bot = 2,
}

/** 需要返回的图表数据 */
export enum MeticsType {
  All = 1,
  TotalConsumption = 2,
  AverageConsumption = 3,
  TotalRequests = 4,
  TotalSuccessfulRequests = 5,
  AverageResponeseTime = 6,
  RequestSuccessRate = 7,
  ErrorCodeDistribution = 8,
}

export enum PermissionScope {
  Workspace = 0,
  Account = 1,
}

export enum PermissionType {
  /** 普通权限 */
  Normal = 0,
  /** 渠道使用 */
  Connector = 1,
}

export enum PlaygroundItemType {
  API = 1,
  WEBSDK = 2,
  RTCSDK = 3,
}

export enum PrincipleType {
  PAT = 1,
  API = 2,
  PATAndAPI = 3,
  BotIDAndAPI = 4,
}

/** --- API 数据页展示 ---
 查询时间范围枚举 */
export enum QueryRange {
  /** 最近7天 */
  Latest_7_Days = 1,
  /** 最近30天 */
  Latest_30_Days = 2,
  /** 历史至今 */
  History = 3,
  /** 今日 */
  Today = 4,
}

export enum TrafficType {
  /** 默认流量 */
  Default = 0,
  /** 专业版 */
  Professional = 1,
}

export enum VisibleStatus {
  Pass = 1,
  Refuse = 2,
}

export interface AnalyticsData {
  /** 图表明--图标 */
  pictures?: Record<string, Picture>;
  start_ms: Int64;
  end_ms: Int64;
}

export interface APIAnalyticsReq {
  query_range: QueryRange;
  metrics_type: MeticsType;
  dimension: AggregateDimension;
  Base?: base.Base;
}

export interface APIAnalyticsResp {
  code: number;
  msg: string;
  data: AnalyticsData;
  BaseResp?: base.BaseResp;
}

export interface APIDetailsData {
  rows: Array<DetailRow>;
}

export interface APIDetailsReq {
  query_range: QueryRange;
  details_type: DetailsType;
  Base?: base.Base;
}

export interface APIDetailsResp {
  code: number;
  msg: string;
  data: APIDetailsData;
  BaseResp?: base.BaseResp;
}

export interface APIFileterInfo {
  path?: string;
  source?: APISource;
  visible_status?: VisibleStatus;
  version?: string;
}

export interface DetailRow {
  total_token: string;
  single_token: string;
  last_used_time: string;
  request_count: string;
  request_success_count: string;
  cost_time: string;
  name: string;
}

export interface GetAPIVisibilityRequest {
  path?: string;
  source?: APISource;
  version?: string;
  Base?: base.Base;
}

export interface GetAPIVisibilityResponse {
  visible_status?: VisibleStatus;
  limit_rule?: Array<RequestLimitRule>;
  BaseResp?: base.BaseResp;
}

/** 获取 path 不同鉴权身份的鉴权点 */
export interface GetPermissionByPathReq {
  path?: string;
  permission_type?: PermissionType;
}

export interface GetPermissionByPathResp {
  /** 格式是 Bot.chat 拼接好的字符串 */
  permission_key?: string;
  BaseResp?: base.BaseResp;
}

export interface GetPermissionListData {
  data?: Array<PermissionInfo>;
}

/** 默认全量返回 */
export interface GetPermissionListReq {
  /** 可以用key来进行精准匹配 格式 Bot::chat */
  key_list?: Array<string>;
  /** 可以用id来精准匹配 */
  permission_id_list?: Array<string>;
  /** 可以选择传入 “release” “inhouse” 来选择版本 */
  version?: CozeVersion;
  permission_type?: PermissionType;
  /** 完整 permission key 匹配. 格式 Bog::chat，并同时会把分组节点查询出来。 key_list 用于 v1 版本查询 */
  full_key_list?: Array<string>;
  Base?: base.Base;
}

/** 获取权限列表v2，返回按照displayname聚合 */
export interface GetPermissionListReqV2 {
  /** 可以用key来进行精准匹配 格式 Bot::chat */
  key_list?: Array<string>;
  /** 可以用id来精准匹配 */
  permission_id_list?: Array<string>;
  /** 可以选择传入 “release” “inhouse” 来选择版本 */
  version?: CozeVersion;
  permission_type?: PermissionType;
  Base?: base.Base;
}

export interface GetPermissionListResp {
  code?: number;
  msg?: string;
  data?: GetPermissionListData;
  BaseResp?: base.BaseResp;
}

export interface GetPermissionListRespV2 {
  code?: number;
  msg?: string;
  data?: GetPermissionListData;
  BaseResp?: base.BaseResp;
}

export interface GetPlaygroundApiInfoReq {
  url_key: string;
  Base?: base.Base;
}

export interface GetPlaygroundApiInfoResp {
  /** eg. https://api.coze.cn/v1/bot/create */
  url: string;
  /** eg. /v1/bot/create */
  path: string;
  /** eg. GET, POST */
  method: string;
  /** eg. editConversation */
  permission?: string;
  /** swagger openapi specification. 目前是 3.0.3 */
  swagger_openapi_spec: string;
  /** 代码示例 */
  code_example?: Array<PlaygroundCodeExample>;
  /** stream/blob 前端需要在执行请求之前知道 response type，所以这里要返回 */
  response_type?: string;
  BaseResp?: base.BaseResp;
}

export interface GetPlaygroundItemListReq {
  Base?: base.Base;
}

export interface GetPlaygroundItemListResp {
  categories: Array<PlaygroundCategory>;
  BaseResp?: base.BaseResp;
}

export interface GetPlaygroundWebSdkInfoReq {
  version?: string;
  Base?: base.Base;
}

export interface GetPlaygroundWebSdkInfoResp {
  version: string;
  sample: Array<PlaygroundWebSdkCodeSample>;
  /** 所有的版本 */
  version_list?: Array<string>;
  BaseResp?: base.BaseResp;
}

export interface OauthQuickstartConfigReq {
  client_type?: string;
  Base?: base.Base;
}

export interface OauthQuickstartConfigResp {
  lang_config?: Array<OauthQuickstartLangConfig>;
  BaseResp?: base.BaseResp;
}

export interface OauthQuickstartLangConfig {
  /** 本次返回的 lang 的配置 */
  lang?: string;
  /** 使用指引 */
  instruction?: string;
  /** 下载链接（tos) */
  download_url?: string;
}

export interface PermissionInfo {
  permission_id?: string;
  key?: string;
  description?: string;
  display_name?: string;
  /** 子权限点 */
  childrens?: Array<PermissionInfo>;
  /** release是否可见 */
  release_status?: VisibleStatus;
  /** inhouse是否可见 */
  inhouse_status?: VisibleStatus;
  create_time?: string;
  update_time?: string;
  parent_id?: string;
  /** ppe是否可见 */
  ppe_status?: VisibleStatus;
  permission_type?: PermissionType;
  /** 是否是空间相关资源权限 */
  permission_scope?: PermissionScope;
  permission_key?: string;
}

export interface PictrueData {
  /** 绘图数据
x轴数据 */
  x_value: Int64;
  /** y轴数据 */
  y_value: number;
}

export interface Picture {
  picture_data: Array<PictrueData>;
  total: number;
  last_total: number;
}

export interface PlaygroundCategory {
  /** 例如 Agent, Chat, Conversation 等 */
  title: string;
  icon_url: string;
  items: Array<PlaygroundItem>;
}

export interface PlaygroundCodeExample {
  /** curl, python, javascript */
  language: string;
  /** eg. Curl Request */
  title: string;
  /** nunjucks 模版, 如果长度为 0，则置灰该语言 */
  examples: Array<string>;
  example_name: Array<string>;
}

export interface PlaygroundItem {
  /** 展示的文案 */
  title: string;
  /** 用于请求 GetPlaygroundApiInfo 的 key(仅 Type==API 时有效) */
  url_key: string;
  type: PlaygroundItemType;
}

export interface PlaygroundOpenApiDocReq {
  'x-arcosite-action'?: string;
  body?: Blob;
  'Content-Type'?: string;
  Base?: base.Base;
}

export interface PlaygroundOpenApiDocResp {
  body?: Blob;
  BaseResp?: base.BaseResp;
}

export interface PlaygroundWebSdkCodeSample {
  file_name: string;
  /** 纯文本 */
  content: string;
}

export interface RequestLimitRule {
  /** 主体类型 */
  type?: PrincipleType;
  /** 间隔时间 单位s */
  duration?: number;
  /** 限制次数 */
  limit_count?: number;
  /** 专业版标识 */
  traffic_type?: TrafficType;
}

/** 从 apihub 同步最新的 openapi 定义与接口描述
 apihub 地址: https://apihub.bytedance.net/project/3713/interface/api */
export interface SyncFromApiHubReq {
  raw_body?: Blob;
  Base?: base.Base;
}

export interface SyncFromApiHubResp {
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
