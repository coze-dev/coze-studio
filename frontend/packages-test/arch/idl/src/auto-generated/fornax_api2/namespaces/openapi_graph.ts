/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as graph from './graph';

export type Int64 = string | number;

export interface NodeWithSlots {
  nodeUID: string;
  nodeType: graph.NodeType;
  slots?: Array<Slot>;
}

export interface Slot {
  graphUID: string;
  nodeUID: string;
  slotUID: string;
  /** JSON 编码的值 */
  value: string;
}
/* eslint-enable */
