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

import { type ReactNode } from 'react';

import {
  type CSpanSingle,
  type CSPanBatch,
  type CSpan,
  getTokens,
  getSpanProp,
  type FieldItem,
  fieldItemHandlers,
} from '@coze-devops/common-modules/query-trace';
import { checkIsBatchBasicCSpan } from '@coze-devops/common-modules/query-trace';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/bot-semi';

import { SPAN_STATUS_CONFIG_MAP } from '../consts/span';
import { EMPTY_TEXT } from '../consts';
import { formatTime } from '.';

const getLatencyFirst = (_span: CSpan) => {
  if (_span === undefined) {
    return undefined;
  }

  if (checkIsBatchBasicCSpan(_span)) {
    const span = _span as CSPanBatch;
    let startTimeFirstResp = Number.POSITIVE_INFINITY;
    span.spans.forEach(subSpan => {
      if (
        subSpan.extra !== undefined &&
        'start_time_first_resp' in subSpan.extra &&
        subSpan.extra?.start_time_first_resp !== '0'
      ) {
        startTimeFirstResp = Math.min(
          startTimeFirstResp,
          Number(subSpan.extra?.start_time_first_resp),
        );
      }
    });

    if (startTimeFirstResp === Number.POSITIVE_INFINITY) {
      return undefined;
    }
    return startTimeFirstResp - span.start_time;
  } else {
    const span = _span as CSpanSingle;
    if (
      span.extra !== undefined &&
      'start_time_first_resp' in span.extra &&
      span.extra?.start_time_first_resp !== '0'
    ) {
      return Number(span?.extra?.start_time_first_resp) - span.start_time;
    } else {
      return undefined;
    }
  }
};

const getFieldStatus = (span: CSpan): FieldItem => {
  const { status } = span;
  const { label } = SPAN_STATUS_CONFIG_MAP[status] ?? {};
  return {
    key: I18n.t('analytic_query_status'),
    value: label ? I18n.t(label as I18nKeysNoOptionsType) : undefined,
  };
};

const getFieldLatencyFirst = (span: CSpan): FieldItem => {
  const latencyFirst = getLatencyFirst(span);
  return {
    key: I18n.t('analytic_query_latencyfirst'),
    value: latencyFirst !== undefined ? `${latencyFirst}ms` : EMPTY_TEXT,
  };
};

const getFieldFirstResponseTime = (span: CSpan): FieldItem => {
  const startTimeFirstResp = getSpanProp(span, 'start_time_first_resp');
  return {
    key: I18n.t('analytic_query_firstrestime'),
    value:
      !startTimeFirstResp || startTimeFirstResp === '0'
        ? '-'
        : formatTime(Number(startTimeFirstResp)),
  };
};

const getFieldTokens = (span: CSpan): FieldItem => {
  const genValueRender = (
    inputTokens?: number,
    outputTokens?: number,
  ): ReactNode => {
    if (inputTokens !== undefined && outputTokens !== undefined) {
      return (
        <Tooltip
          content={
            <article>
              <div className="whitespace-nowrap">
                Input Tokens: {inputTokens}
              </div>
              <div className="whitespace-nowrap">
                Output Tokens: {outputTokens}
              </div>
            </article>
          }
          position="bottom"
        >
          <div style={{ fontSize: 12 }}>{inputTokens + outputTokens}</div>
        </Tooltip>
      );
    } else {
      return EMPTY_TEXT;
    }
  };
  const { input_tokens: inputTokens, output_tokens: outputTokens } =
    getTokens(span);
  return {
    key: I18n.t('analytic_query_tokens'),
    value: genValueRender(inputTokens, outputTokens),
  };
};

const getFieldLogId = (span: CSpan): FieldItem => ({
  key: I18n.t('analytic_query_logid'),
  value: getSpanProp(span, 'log_id') as string,
});

export const fieldHandlers = {
  ...fieldItemHandlers,
  status: getFieldStatus,
  latency_first: getFieldLatencyFirst,
  first_response_time: getFieldFirstResponseTime,
  tokens: getFieldTokens,
  log_id: getFieldLogId,
};

export type FieldType = keyof typeof fieldHandlers;
