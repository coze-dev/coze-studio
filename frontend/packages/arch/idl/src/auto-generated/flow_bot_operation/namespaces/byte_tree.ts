/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export interface ByteTreeData {
  node?: Array<ByteTreeItem>;
}

export interface ByteTreeItem {
  /** 展示用 */
  node_name?: string;
  /** 传参用 */
  node_id?: string;
}

/** 获取服务树下拉列表 */
export interface GetByteTreeByNameReq {
  name?: string;
  Base?: base.Base;
}

export interface GetByteTreeByNameResp {
  code?: number;
  msg?: string;
  data?: ByteTreeData;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
