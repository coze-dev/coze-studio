/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type Node, type Edge } from 'reactflow';
import { type CSSProperties } from 'react';

import { type SpanCategory } from '@coze-arch/bot-api/ob_query_api';
import { type LogBizScene } from '@coze-arch/bot-api/ob_data';
import {
  type TopoInfo,
  type GetTopoInfoReq,
  type TopoType,
} from '@coze-arch/bot-api/dp_manage_api';

import { type SpanNode } from '../../utils/cspan-graph';
import { type DataSource } from '../../typings/graph';
import { type TopologyLayoutDirection } from './constant';

export type ProcessedGetTopoInfoReq = Omit<GetTopoInfoReq, 'Base'>;

export interface TopologyFlowProps {
  spaceId: string;
  botId?: string;
  entityId?: string;
  entityType?: LogBizScene;
  dataSource: DataSource;
  selectedSpanId?: string;
  style?: CSSProperties;
  className?: string;
  renderHeader?: (topologyType: TopoType) => React.ReactNode;
}

export interface UseGenerateTopologyHookData {
  spaceId: string;
  botId?: string;
  entityId?: string;
  entityType?: LogBizScene;
  dataSource: DataSource;
  selectedSpanId?: string;
}

// @ts-expect-error Use the number type to enumerate SpanType as a custom type, the error can be ignored
export type TopologicalNode = Node<NodeData, SpanCategory>;

export type TopologicalEdge = Edge<EdgeData>;

export interface NodeData {
  name: string;
  icon: React.ReactNode;
  layoutDirection: TopologyLayoutDirection;
  dynamicSpanNode?: SpanNode;
}

export interface EdgeData {
  tailDynamicSpanNode?: SpanNode;
  layoutInfo?: {
    customSourceX: number;
    customTargetX: number;
  };
}

export type DynamicNodeMap = Record<string, SpanNode>;
export type DynamicEdgeMap = Record<string, SpanNode>;

export interface DynamicTopologyData {
  dynamicNodeMap: DynamicNodeMap;
  originDynamicNodeMap: DynamicNodeMap;
}

export interface TopologicalData {
  topoType: TopoType;
  nodes: TopologicalNode[];
  edges: TopologicalEdge[];
}

export interface TopologicalLayoutCommonData {
  height: number;
}

export interface TopologicalLayoutBizData extends TopologicalLayoutCommonData {
  icon: React.ReactElement;
}

export interface TopologicalStatusData {
  edgeColor: string;
  nodeClassName: string;
}

export interface TopologicalBatchNodeExecutionInfo {
  isBatch: boolean;
  isError: boolean;
  errorNumber: number;
  totalNumber: number;
}

export interface TopoMetaInfo {
  topoGraph: Record<string, string[]>;
  resourceIdMap: Record<string, string>;
  nodeIdMap: Record<string, string>;
}

export interface StaticTopologyDataCache {
  topoInfoMap?: TopoInfo;
  topoMetaInfo?: TopoMetaInfo;
  upstreamNodeMap?: Record<string, string[]>;
}
