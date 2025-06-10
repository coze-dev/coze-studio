/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as openapi_graph from './openapi_graph';
import * as graph from './graph';

export type Int64 = string | number;

export interface GetGraphSlotsReq {
  spaceID: string;
  graphUID: string;
  psm: string;
  isBOE?: boolean;
  env?: string;
  cluster?: string;
  /** FornaxSDK 鉴权  */
  Authorization?: string;
}

export interface GetGraphSlotsResp {
  nodeSlots: Array<openapi_graph.NodeWithSlots>;
  /** 打点, 跟进问题使用 */
  slotSetVersion?: string;
}

export interface GetNodeSlotsReq {
  spaceID: string;
  graphUID: string;
  nodeUID: string;
  psm: string;
  isBOE?: boolean;
  env?: string;
  cluster?: string;
  /** FornaxSDK 鉴权  */
  Authorization?: string;
}

export interface GetNodeSlotsResp {
  slots: Array<openapi_graph.Slot>;
  nodeType: graph.NodeType;
  /** 打点, 跟进问题使用 */
  slotSetVersion?: string;
}
/* eslint-enable */
