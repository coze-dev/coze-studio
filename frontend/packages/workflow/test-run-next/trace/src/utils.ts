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

import { uniqBy } from 'lodash-es';
import dayjs from 'dayjs';
import {
  type Span,
  type Int64,
  type TraceFrontendSpan,
} from '@coze-arch/bot-api/workflow_api';

import { type GotoParams } from './types';

export const sortSpans = (spans: TraceFrontendSpan[]) =>
  uniqBy(spans, span => span.span_id).sort((a, b) => {
    const startA = a.start_time ? Number(a.start_time) : Infinity;
    const startB = b.start_time ? Number(b.start_time) : Infinity;
    return startA - startB;
  });

export const getTimeFromSpan = (span: Span) =>
  span.start_time ? dayjs(span.start_time).format('YYYY-MM-DD HH:mm:ss') : '-';

export const isTriggerFromSpan = (span: Span) =>
  span.tags?.find(t => t.key === 'is_trigger');

export const getStrFromSpan = (span: Span, key: string): string => {
  const { tags } = span;
  if (!Array.isArray(tags) || !tags.length) {
    return '';
  }
  const target = tags.find(t => t.key === key);
  return target?.value?.v_str || '';
};
export const getLongFromSpan = (span: Span, key: string): Int64 | undefined => {
  const { tags } = span;
  if (!Array.isArray(tags) || !tags.length) {
    return '';
  }
  const target = tags.find(t => t.key === key);
  return target?.value?.v_long;
};

export const getTokensFromSpan = (span: Span) =>
  getLongFromSpan(span, 'tokens');

const DECIMAL = 60;
const UNIT_MILLISECOND = 1000;
const UNIT_SECOND = DECIMAL * UNIT_MILLISECOND;
const UNIT_MINUTES = DECIMAL * UNIT_SECOND;
const UNIT_HOUR = DECIMAL * UNIT_MINUTES;

export function formatDuration(time: number) {
  if (time < UNIT_MILLISECOND) {
    return `${time}ms`;
  } else if (time < UNIT_SECOND) {
    return `${(time / UNIT_MILLISECOND).toFixed(2)}s`;
  } else if (time < UNIT_MINUTES) {
    return `${(time / UNIT_SECOND).toFixed(2)}min`;
  } else if (time < UNIT_HOUR) {
    return `${(time / UNIT_MINUTES).toFixed(2)}h`;
  } else {
    return `${(time / UNIT_HOUR).toFixed(2)}d`;
  }
}

export const getGotoNodeParams = (span: Span): GotoParams => {
  const workflowId = getStrFromSpan(span, 'workflow_id');
  const nodeId = getStrFromSpan(span, 'workflow_node_id');
  const executeId = getStrFromSpan(span, 'execute_id');
  const subExecuteId = getStrFromSpan(span, 'sub_execute_id');

  return {
    workflowId,
    nodeId,
    executeId,
    subExecuteId,
  };
};
