/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as common from './common';

export type Int64 = string | number;

export enum DataSetScopeType {
  ScopeAll = 1,
  ScopeSelf = 2,
}

/** 数据集搜索类型定义 */
export enum DataSetSearchType {
  SearchByCreateTime = 1,
  SearchByUpdateTime = 2,
}

export enum DataSetSource {
  SourceSelf = 1,
  SourceExplore = 2,
}

export enum FrequencyType {
  /** 不更新 */
  None = 0,
  /** 每天追加最新 */
  EveryDay = 1,
  /** 每三天追加最新 */
  EveryThreeDay = 2,
  /** 每七天追加最新 */
  EverySevenDay = 3,
}

export enum RecallChannel {
  Embedding = 0,
  BM25 = 1,
}

export interface BotSimpleInfo {
  name?: string;
  icon_url?: string;
  bot_id?: string;
  creator_id?: string;
}

export interface CopyDatasetList {
  origin_dataset_id: Int64;
  target_dataset_id: Int64;
}

export interface CreateDataSetRequest {
  creator_id?: string;
  name?: string;
  description?: string;
  icon_uri?: string;
  space_id?: string;
  Base?: base.Base;
}

export interface CreateDataSetResponse {
  data_set_id?: string;
  code: Int64;
  msg: string;
  BaseResp?: base.BaseResp;
}

export interface DeleteDataSetRequest {
  data_set_id?: string;
  creator_id?: string;
  Base?: base.Base;
}

export interface DeleteDataSetResponse {
  code: Int64;
  msg: string;
  BaseResp?: base.BaseResp;
}

export interface GetBotListByDatasetReq {
  dataset_id: string;
  page_size?: string;
  /** 从1开始 */
  page_no?: string;
  Base?: base.Base;
}

export interface GetBotListByDatasetResp {
  bot_list?: Array<BotSimpleInfo>;
  total?: string;
  code: Int64;
  msg: string;
  BaseResp?: base.BaseResp;
}

export interface ListDataSetV2Request {
  creator_id?: string;
  /** 关键字搜索 */
  query?: string;
  /** 搜索类型 */
  search_type?: DataSetSearchType;
  page?: number;
  size?: number;
  dataset_ids?: Array<string>;
  space_id?: string;
  /** 搜索类型 */
  scope_type?: DataSetScopeType;
  /** 来源 */
  source_type?: DataSetSource;
  Base?: base.Base;
}

export interface ListDataSetV2Response {
  data_set_infos?: Array<common.DataSetInfo>;
  total?: number;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface RecallDataSetData {
  memory?: Array<RecallDataSetInfo>;
}

export interface RecallDataSetInfo {
  slice?: string;
  score?: number;
}

export interface RecallStrategy {
  recall_channels?: Array<RecallChannel>;
  rerank_model?: string;
  use_rerank?: boolean;
  use_rewrite?: boolean;
  use_nl2sql?: boolean;
  is_personal_only?: boolean;
}

export interface UpdateDataSetMetaRequest {
  data_set_id?: string;
  creator_id?: string;
  name?: string;
  icon_uri?: string;
  description?: string;
  Base?: base.Base;
}

export interface UpdateDataSetMetaResponse {
  code: Int64;
  msg: string;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
