/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_devops_knowledge_common from './flow_devops_knowledge_common';
import * as base from './base';

export type Int64 = string | number;

export interface Channel {
  field?: string;
  top_k?: number;
  min_score?: number;
}

export interface Item {
  doc_id?: string;
  score?: number;
  /** chunk数据 */
  slice?: string;
  slice_meta?: string;
  knowledge_meta?: KnowledgeRetrieveMeta;
  channels?: Array<RetrieveChannel>;
}

export interface KnowledgeRetrieveMeta {
  file_url?: string;
  title?: string;
  resource_type?: flow_devops_knowledge_common.ResourceType;
  knowledge_key?: string;
  chunk_size?: Int64;
}

export interface Ranker {
  type?: string;
  params?: RerankParams;
}

export interface RecallData {
  items?: Array<Item>;
}

export interface RerankParams {
  min_score?: number;
}

export interface RetrieveChannel {
  source?: string;
  score?: number;
}

export interface RetrieveReq {
  Authorization?: string;
  knowledge_keys?: Array<string>;
  query?: string;
  channels?: Array<Channel>;
  top_k?: number;
  rank?: Ranker;
  base?: base.Base;
}

export interface RetrieveResp {
  code?: number;
  msg?: string;
  data?: RecallData;
  base_resp?: base.BaseResp;
}
/* eslint-enable */
