/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export interface ImportKnowledgeTableDataReq {
  Authorization?: string;
  document_id?: Int64;
  entries?: Array<Record<string, string>>;
  base?: base.Base;
}

export interface ImportKnowledgeTableDataResp {
  base_resp?: base.BaseResp;
}
/* eslint-enable */
