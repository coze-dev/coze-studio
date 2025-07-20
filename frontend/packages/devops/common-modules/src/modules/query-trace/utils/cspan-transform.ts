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

// spans直接聚合，生成batchSpan
const genBatchSpan = function (
  spans: CSpanSingleForBatch[],
  spanCategoryMap?: SpanCategoryMap,
): CSPanBatch | undefined {
  if (spans.length === 0) {
    return undefined;
  }
  // 合法性检查
  const taskTotal = spans[0].extra?.task_total;
  const spans0 = spans.filter(curSpan => {
    const curTaskTotal = curSpan.extra?.task_total;
    return curTaskTotal !== taskTotal;
  });
  // taskTotal不全部相等，数据不合法
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

  // 根据 workflowNodeId + type对span进行归类
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

  // 进一步根据时间+序号进行归类，生成CSpanBatch
  Object.keys(map).forEach(key => {
    const workflowSpans = map[key];

    // 排序：时间
    workflowSpans.sort(compareByStartAt);

    // 根据task_index进行聚合
    let curTaskIndexs: number[] = [];
    let curSpans: CSpanSingleForBatch[] = [];
    workflowSpans.forEach(span => {
      const taskIndex = span.extra?.task_index;
      if (taskIndex === undefined) {
        return;
      }

      if (curTaskIndexs.includes(taskIndex)) {
        // 序号存在了，则新开启一组
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
 * 处理原始Span（将额外节点字段统一到extra）
 * @param span Span
 * @returns CSpanSingle
 */
// eslint-disable-next-line complexity -- 参数过多
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

  // 根据span.id进行去重
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
