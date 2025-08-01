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

import { pick, uniqBy } from 'lodash-es';
import {
  type Span,
  SpanStatus,
  type SpanCategory,
} from '@coze-arch/bot-api/ob_query_api';

import {
  type CSpanSingle,
  type CSpan,
  type CSPanBatch,
  type SpanCategoryMeta,
  type SpanCategoryMap,
  type CSpanSingleForBatch,
} from '../typings/cspan';
import { isBatchSpanType } from './cspan';

const compareByStartAt = (
  a: CSpanSingleForBatch,
  b: CSpanSingleForBatch,
): number => {
  if (a.start_time > b.start_time) {
    return 1;
  } else if (a.start_time < b.start_time) {
    return -1;
  } else {
    return 0;
  }
};

const compareByTaskIndex = (
  a: CSpanSingleForBatch,
  b: CSpanSingleForBatch,
): number => {
  const taskIndexA = a.extra?.task_index ?? 0;
  const taskIndexB = a.extra?.task_index ?? 0;
  if (taskIndexA > taskIndexB) {
    return 1;
  } else if (taskIndexA < taskIndexB) {
    return -1;
  } else {
    return 0;
  }
};

const getStartAtForBatch = (spans: CSpanSingleForBatch[]): number => {
  let startAt = Number.POSITIVE_INFINITY;
  spans.forEach(span => {
    startAt = Math.min(span.start_time, startAt);
  });
  return startAt;
};

const getLatencyForBatch = (spans: CSpanSingleForBatch[]): number => {
  let endAt = Number.NEGATIVE_INFINITY;
  spans.forEach(span => {
    endAt = Math.max(span.start_time + span.latency, endAt);
  });
  const startAt = getStartAtForBatch(spans);
  return endAt - startAt;
};

const getStatusForBatch = (spans: CSpanSingleForBatch[]): SpanStatus => {
  let isSuccess = true;
  spans.forEach(span => {
    if (span.status === SpanStatus.Error) {
      isSuccess = false;
    }
  });
  return isSuccess ? SpanStatus.Success : SpanStatus.Error;
};

// Spans are directly polymerized to generate batchSpan.
const genBatchSpan = function (
  spans: CSpanSingleForBatch[],
  spanCategoryMap?: SpanCategoryMap,
): CSPanBatch | undefined {
  if (spans.length === 0) {
    return undefined;
  }
  // legality check
  const taskTotal = spans[0].extra?.task_total;
  const spans0 = spans.filter(curSpan => {
    const curTaskTotal = curSpan.extra?.task_total;
    return curTaskTotal !== taskTotal;
  });
  // taskTotal is not all equal, the data is invalid
  if (spans0.length > 0) {
    return undefined;
  }

  return {
    ...pick(spans[0], ['trace_id', 'id', 'parent_id', 'name', 'type']),
    category: spanCategoryMap?.[spans[0].type],
    status: getStatusForBatch(spans),
    start_time: getStartAtForBatch(spans),
    latency: getLatencyForBatch(spans),
    spans: spans.sort(compareByTaskIndex),
    workflow_node_id: spans[0].extra?.workflow_node_id,
  };
};

const aggregationBatchSpan = function (
  spans: CSpanSingleForBatch[],
  spanCategoryMap?: SpanCategoryMap,
) {
  const batchSpans: CSPanBatch[] = [];

  // Sorting spans by workflowNodeId + type
  const map: {
    [key: string]: CSpanSingleForBatch[];
  } = {};
  spans.forEach(span => {
    const { type } = span;
    const workflowNodeId = span.extra?.workflow_node_id;
    if (!workflowNodeId) {
      return;
    }
    map[type + workflowNodeId] = map[type + workflowNodeId] ?? [];
    map[type + workflowNodeId].push(span);
  });

  // Further classify according to time + serial number to generate CSpanBatch
  Object.keys(map).forEach(key => {
    const workflowSpans = map[key];

    // Sort by: Time
    workflowSpans.sort(compareByStartAt);

    // Aggregate according to task_index
    let curTaskIndexs: number[] = [];
    let curSpans: CSpanSingleForBatch[] = [];
    workflowSpans.forEach(span => {
      const taskIndex = span.extra?.task_index;
      if (taskIndex === undefined) {
        return;
      }

      if (curTaskIndexs.includes(taskIndex)) {
        // If the serial number exists, open a new set.
        const batchSpan = genBatchSpan(curSpans, spanCategoryMap);
        if (batchSpan) {
          batchSpans.push(batchSpan);
        }
        curTaskIndexs = [];
        curSpans = [];
      }
      curTaskIndexs.push(taskIndex);
      curSpans.push(span);
    });

    const batchSpan = genBatchSpan(curSpans, spanCategoryMap);
    if (batchSpan) {
      batchSpans.push(batchSpan);
    }
  });

  return batchSpans;
};

/**
 * Process raw Span (unify extra node fields to extra)
 * @param span Span
 * @returns CSpanSingle
 */
// eslint-disable-next-line complexity -- too many parameters
export const span2CSpan = function (
  span: Span,
  spanCategoryMap?: SpanCategoryMap,
): CSpanSingle {
  const cspan: CSpanSingle = {
    trace_id: span.trace_id,
    id: span.id,
    parent_id: span.parent_id,
    name: span.name,
    type: span.type,
    start_time: Number(span.start_time),
    latency: Number(span.latency),
    status: span.status,
    category: spanCategoryMap?.[span.type],
  };
  cspan.extra =
    span.attr_user_input ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (span as any).attr_user_input_v2 ??
    span.attr_invoke_agent ??
    span.attr_restart_agent ??
    span.attr_switch_agent ??
    span.attr_llm_call ??
    span.attr_workflow_llm_call ??
    span.attr_llm_batch_call ??
    span.attr_workflow_llm_batch_call ??
    span.attr_workflow ??
    span.attr_workflow_end ??
    span.attr_code ??
    span.attr_workflow_code ??
    span.attr_code_batch ??
    span.attr_workflow_code_batch ??
    span.attr_condition ??
    span.attr_workflow_condition ??
    span.attr_plugin_tool ??
    span.attr_workflow_plugin_tool ??
    span.attr_plugin_tool_batch ??
    span.attr_workflow_plugin_tool_batch ??
    span.attr_knowledge ??
    span.attr_workflow_knowledge ??
    span.attr_card ??
    span.attr_workflow_message ??
    span.attr_chain ??
    span.attr_hook ??
    span.attr_bw_start ??
    span.attr_bw_end ??
    span.attr_bw_batch ??
    span.attr_bw_loop ??
    span.attr_bw_condition ??
    span.attr_bw_llm ??
    span.attr_bw_parallel ??
    span.attr_bw_variable ??
    span.attr_bw_call_flow ??
    span.attr_bw_connector ??
    span.attr_bw_script;
  return cspan;
};

const genSpanCategoryMap = (
  spanCategoryMeta: SpanCategoryMeta,
): SpanCategoryMap => {
  const map: SpanCategoryMap = {};
  Object.keys(spanCategoryMeta).forEach(key => {
    const spanCategoryValue = Number(key) as SpanCategory;
    const spanTypes = spanCategoryMeta[spanCategoryValue];
    spanTypes?.forEach(spanTypeValue => {
      map[spanTypeValue] = spanCategoryValue;
    });
  });
  return map as SpanCategoryMap;
};

export const spans2CSpans = function (
  spans: Span[],
  spanCategoryMeta?: SpanCategoryMeta,
): CSpan[] {
  const spanCategoryMap = spanCategoryMeta
    ? genSpanCategoryMap(spanCategoryMeta)
    : undefined;

  // Deduplicate according to span.id
  const uniqSpans = uniqBy(spans, 'id');

  // Span -> CSpanSingle
  const cSpans = uniqSpans.map(span => span2CSpan(span, spanCategoryMap));

  const singleCSpans = cSpans.filter(({ type }) => !isBatchSpanType(type));
  // CSpanSingle[] -> CSpanBatch[]
  const batchCSpans = aggregationBatchSpan(
    cSpans.filter(({ type }) => isBatchSpanType(type)) as CSpanSingleForBatch[],
    spanCategoryMap,
  );

  return [...singleCSpans, ...batchCSpans];
};
