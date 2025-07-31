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

import { omit } from 'lodash-es';
import {
  SpanCategory,
  SpanStatus,
  SpanType,
} from '@coze-arch/bot-api/ob_query_api';

import { type CSpan } from '../typings/cspan';
import { rootBreakSpanId } from '../constant';
import {
  spanStatusConfigMap as defaultSpanStatusConfigMap,
  spanTypeConfigMap as defaultSpanTypeConfigMap,
} from '../config/cspan';
import { genVirtualStart, isVisibleSpan } from './cspan';

export type SpanNode = CSpan & {
  parent?: SpanNode;
  children?: SpanNode[];
};

export const getSpanDataByTraceId = (traceId: string): CSpan[] => [];

// Get the heel node of the tree
export const buildCallTrees = (
  spans: CSpan[],
  splitBatchSpan = true,
): SpanNode[] => {
  const roots: SpanNode[] = [];

  const map: {
    [spanId: string]: SpanNode;
  } = {};

  spans.forEach(span => {
    const curSpan = { ...span, children: [] };
    // Batch Node
    if ('spans' in span && splitBatchSpan) {
      span.spans.forEach(subSpan => {
        map[subSpan.id] = curSpan;
      });
    } else {
      const { id: spanId } = span;
      map[spanId] = curSpan;
    }
  });

  spans.forEach(span => {
    const { id: spanId, parent_id: parentSpanId } = span;
    const spanNode = map[spanId];
    const parentSpanNode = map[parentSpanId];

    if (parentSpanId === '' || parentSpanNode === undefined) {
      roots.push(spanNode);
    } else {
      parentSpanNode.children = parentSpanNode.children ?? [];
      parentSpanNode.children.push(spanNode);
      spanNode.parent = parentSpanNode;
    }
  });

  return roots;
};

export const getRootSpan = (spans: SpanNode[], needBuildTrees = true) => {
  const rootSpans = needBuildTrees ? buildCallTrees(spans) : spans;

  const startSpans: SpanNode[] = [];
  rootSpans.forEach(rootSpan => {
    const { category } = rootSpan;
    if (category === SpanCategory.Start) {
      startSpans.push(rootSpan);
    }
  });

  // Scenarios without start: virtual one StartSpan (for multiple parties to use, flame map, tree map, detail map to ensure consistency); multiple StartSpans, take the first one
  return startSpans.length > 0 ? startSpans[0] : genVirtualStart(rootSpans);
};

export const getBreakSpans = (spans: SpanNode[], needBuildTrees = true) => {
  const rootSpans = needBuildTrees ? buildCallTrees(spans) : spans;

  const breakSpans: SpanNode[] = [];
  rootSpans.forEach(rootSpan => {
    const { category } = rootSpan;
    if (category !== SpanCategory.Start) {
      breakSpans.push(rootSpan);
    }
  });
  return breakSpans;
};

export const compareByStartAt = (spanA: SpanNode, spanB: SpanNode) => {
  const startAtA = spanA.start_time;
  const startAtB = spanB.start_time;
  if (startAtA > startAtB) {
    return 1;
  } else if (startAtA < startAtB) {
    return -1;
  } else {
    return 0;
  }
};

export const compareByEndAt = (spanA: SpanNode, spanB: SpanNode) => {
  const endAtA = spanA.start_time + spanA.latency;
  const endAtB = spanB.start_time + spanB.latency;
  if (endAtA > endAtB) {
    return 1;
  } else if (endAtA < endAtB) {
    return -1;
  } else {
    return 0;
  }
};

export const getSpanTitle = (
  span: CSpan,
  spanTypeConfigMap = defaultSpanTypeConfigMap,
) => {
  const { type, name = '' } = span;
  const typeName = spanTypeConfigMap[type]?.label ?? '';
  if (name && name !== typeName) {
    return `${typeName} ${name}`;
  } else {
    return typeName;
  }
};

export const getStatusLabel = (
  span: CSpan,
  spanStatusConfigMap = defaultSpanStatusConfigMap,
) => {
  const { status } = span;
  return spanStatusConfigMap[status]?.label ?? '';
};

// When the start node does not exist, generate a virtual start node
const getRootBreakSpan = (breakSpans: SpanNode[]): SpanNode => ({
  id: rootBreakSpanId,
  parent_id: '',
  trace_id: '',
  name: '',
  type: SpanType.UserInput,
  status: SpanStatus.Broken,
  start_time: -1,
  latency: -1,
  children: breakSpans,
});

// Create a parent-child relationship according to switchAgent/reStartAgent
const handleAgent = (spans: SpanNode[]): SpanNode[] => {
  const getAgent = (startAt: number, agents: SpanNode[]) => {
    const len = agents.length;
    for (let i = 0; i < len; i++) {
      const curAgent = agents[i];
      const nextAgent = agents[i + 1];
      const curEndAt = curAgent.start_time + curAgent.latency;
      const nextEndAt = nextAgent
        ? nextAgent.start_time + nextAgent.latency
        : Number.POSITIVE_INFINITY;

      if (startAt >= curEndAt && startAt <= nextEndAt) {
        return agents[i];
      }
    }
    return undefined;
  };

  const agentSpans = spans
    .filter(
      span =>
        span.type === SpanType.SwitchAgent ||
        span.type === SpanType.RestartAgent,
    )
    .sort(compareByEndAt);

  const normalSpans = spans
    .filter(
      span =>
        span.type !== SpanType.SwitchAgent &&
        span.type !== SpanType.RestartAgent,
    )
    .sort(compareByStartAt);

  const rstSpans: SpanNode[] = [];
  normalSpans.forEach(span => {
    const agent = getAgent(span.start_time, agentSpans);
    if (agent) {
      agent.children = agent.children ?? [];
      agent.children?.push(span);
      span.parent = agent;
    } else {
      rstSpans.push(span);
    }
  });

  return [...rstSpans, ...agentSpans];
};

// Only special node types can be used as root nodes
const isTreeRootSpanType = (type: SpanType) =>
  [
    SpanType.InvokeAgent,
    SpanType.Workflow,
    SpanType.LLMBatchCall,
    SpanType.LLMCall,
    SpanType.WorkflowLLMCall,
    SpanType.WorkflowLLMBatchCall,
    // All BlockWise's are put here
    SpanType.BWStart,
    SpanType.BWEnd,
    SpanType.BWBatch,
    SpanType.BWLoop,
    SpanType.BWCondition,
    SpanType.BWLLM,
    SpanType.BWParallel,
    SpanType.BWScript,
    SpanType.BWVariable,
    SpanType.BWCallFlow,
    SpanType.BWConnector,
    // New types all support hierarchies
    SpanType.Hook,
  ].includes(type);

// Build TraceTree based on call tree
const callTree2TraceTree = (rootSpan: SpanNode): SpanNode => {
  const rstSpans: SpanNode[] = [];
  const walk = (span: SpanNode) => {
    span.children?.forEach(subSpan => {
      const { type } = subSpan;
      if (isTreeRootSpanType(type)) {
        rstSpans.push(callTree2TraceTree(subSpan));
      } else {
        if (isVisibleSpan(subSpan)) {
          // The current node is added to rootSpan.children
          rstSpans.push(omit(subSpan, 'children'));
        }
        // Recursive sub-node (current node). Note: The type of hidden node should also be recursive. The current node is hidden, and its sub-node may be displayed
        walk(subSpan);
      }
    });
  };
  walk(rootSpan);

  return {
    ...rootSpan,
    children: handleAgent(rstSpans),
  };
};

export const buildTraceTree = (spans: SpanNode[], splitBatchSpan?: boolean) => {
  // 1. According to spans, assemble call trees
  const callTrees = buildCallTrees(spans, splitBatchSpan);

  // 2. Generate the gastSpan
  const startSpan: SpanNode = getRootSpan(callTrees, false);

  // 3. Get the break node (all non-start root nodes are breakSpan)
  const breakSpans: SpanNode[] = getBreakSpans(callTrees, false);

  // 4. According to the call tree, generate the Tree in PRD (ie, the Tree in PRD)
  const treeStartSpan = callTree2TraceTree(startSpan);

  if (breakSpans.length > 0) {
    // 5. Mount all breakSpans under the rootBreakSpan node
    const breakSpan: SpanNode = getRootBreakSpan(breakSpans);
    // 6. Generate TraceTree according to the call tree
    const treeBreakSpan = callTree2TraceTree(breakSpan);

    // 7. Hang treeBreakSpan under treeStartSpan
    treeStartSpan.children = treeStartSpan.children ?? [];
    treeStartSpan.children.push(treeBreakSpan);
    treeBreakSpan.parent = treeStartSpan;
  }
  return treeStartSpan;
};
