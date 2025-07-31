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

import { I18n } from '@coze-arch/i18n';

import {
  type CSpanAttrInvokeAgent,
  type CSpan,
  type StreamingOutputStatus,
} from '../typings/cspan';
import {
  botEnvConfigMap,
  spanCategoryConfigMap,
  spanTypeConfigMap,
  streamingOutputStatusConfigMap,
} from '../config/cspan';
import { formatTime } from './format-time';
import { getSpanProp } from './cspan';

export interface FieldItem {
  key?: string | ReactNode;
  value?: string | number | boolean | ReactNode;
}

const getFieldCategory = (span: CSpan): FieldItem => {
  const { category } = span;
  const categoryConfig =
    category !== undefined ? spanCategoryConfigMap[category] : undefined;
  return {
    key: I18n.t('analytic_query_type'),
    value: categoryConfig?.label,
  };
};

const getFieldType = (span: CSpan): FieldItem => {
  const { type } = span;
  const typeConfig = spanTypeConfigMap[type];
  return {
    key: I18n.t('analytic_query_subtype'),
    value: typeConfig?.label,
  };
};

const getFieldOS = (span: CSpan): FieldItem => {
  const os = getSpanProp(span, 'os');
  const osVersion = getSpanProp(span, 'os_version');

  return {
    key: I18n.t('analytic_query_os'),
    value: os ? `${os}${osVersion ? ` ${osVersion}` : ''}` : undefined,
  };
};

const getFieldLatency = (span: CSpan): FieldItem => {
  const { latency } = span;
  return {
    key: I18n.t('analytic_query_latency'),
    value: latency !== undefined ? `${latency}ms` : undefined,
  };
};

const getFieldName = (span: CSpan): FieldItem => {
  const { name } = span;
  return {
    key: I18n.t('analytic_query_name'),
    value: name,
  };
};

const getFieldOffline = (span: CSpan): FieldItem => {
  const botEnv = getSpanProp(span, 'bot_env') as string;
  const botEnvConfig =
    botEnv !== undefined ? botEnvConfigMap[botEnv] : undefined;
  return {
    key: I18n.t('analytic_query_env'),
    value: botEnvConfig?.label,
  };
};

const getFieldStartTime = (span: CSpan): FieldItem => {
  const { start_time } = span;
  return {
    key: I18n.t('analytic_query_starttime'),
    value: formatTime(start_time),
  };
};

const getFieldEndTime = (span: CSpan): FieldItem => {
  const startAt = span?.start_time;
  const latency = span?.latency;
  return {
    key: I18n.t('analytic_query_endtime'),
    value:
      startAt !== undefined && latency !== undefined
        ? formatTime(Number(startAt) + Number(latency))
        : undefined,
  };
};

const getFieldCallType = (span: CSpan): FieldItem => ({
  key: I18n.t('analytic_query_calltype'),
  value: getSpanProp(span, 'call_type') as string,
});

const getFieldAgentType = (_span: CSpan): FieldItem => {
  const span = _span as CSpanAttrInvokeAgent;
  return {
    key: I18n.t('analytic_query_agenttype'),
    value: span.extra?.agent_type,
  };
};

const getFieldModel = (span: CSpan): FieldItem => ({
  key: I18n.t('analytic_query_model'),
  value: getSpanProp(span, 'model') as string,
});

const getFieldTemperature = (span: CSpan): FieldItem => ({
  key: I18n.t('analytic_query_temperature'),
  value: getSpanProp(span, 'temperature') as string,
});

const getFieldDialogRound = (_span: CSpan): FieldItem => {
  const span = _span as CSpanAttrInvokeAgent;
  return {
    key: I18n.t('analytic_query_diagloground'),
    value: span.extra?.dialog_round,
  };
};

const getFieldMaxLengthResp = (span: CSpan): FieldItem => ({
  key: I18n.t('analytic_query_resmaxlen'),
  value: getSpanProp(span, 'max_length_resp') as string,
});

const getFieldChannel = (span: CSpan): FieldItem => ({
  key: I18n.t('analytic_query_channel'),
  value: getSpanProp(span, 'channel') as string,
});

const getFieldInputType = (span: CSpan): FieldItem => ({
  key: I18n.t('analytic_query_inputtype'),
  value: getSpanProp(span, 'query_input_method') as string,
});

const getFieldInput = (span: CSpan): FieldItem => ({
  key: I18n.t('analytic_query_input'),
  value: getSpanProp(span, 'input') as string,
});

const getStreamOutput = (span: CSpan): FieldItem => {
  const value = getSpanProp(span, 'streaming_output') as StreamingOutputStatus;
  // Key to starling key
  return {
    key: I18n.t('query_stream_output'),
    value: streamingOutputStatusConfigMap[value]?.label,
  };
};

const getCardId = (span: CSpan): FieldItem => {
  const value = getSpanProp(span, 'card_id') as string;
  return { key: I18n.t('query_card_id'), value };
};

const getBranchName = (span: CSpan): FieldItem => {
  const value = getSpanProp(span, 'branch_name') as string;
  return { key: 'branch_name', value };
};

const getNodeType = (span: CSpan): FieldItem => {
  const value = getSpanProp(span, 'node_type') as string;
  return { key: 'node_type', value };
};

const getHookType = (span: CSpan): FieldItem => {
  const value = getSpanProp(span, 'hook_type') as string;
  return {
    key: I18n.t('codedev_hook_hook_type'),
    value,
  };
};

const getHookUri = (span: CSpan): FieldItem => {
  const value = getSpanProp(span, 'hook_uri') as string;
  return {
    key: 'Hook Uri',
    value,
  };
};

const getAgentId = (span: CSpan): FieldItem => {
  const value = getSpanProp(span, 'agent_id') as string;
  return {
    key: 'AgentId',
    value,
  };
};

const getHookRespCode = (span: CSpan): FieldItem => {
  const value = getSpanProp(span, 'hook_resp_code')?.toString() as string;
  return {
    key: I18n.t('analytic_query_hook_resp_code'),
    value,
  };
};

const getIsStream = (span: CSpan): FieldItem => {
  const value = getSpanProp(span, 'is_stream')?.toString() as string;
  return {
    key: I18n.t('query_stream_output'),
    value,
  };
};

export const fieldItemHandlers = {
  category: getFieldCategory,
  type: getFieldType,
  os: getFieldOS,
  latency: getFieldLatency,
  offline: getFieldOffline,
  name: getFieldName,
  start_time: getFieldStartTime,
  end_time: getFieldEndTime,
  call_type: getFieldCallType,
  agent_type: getFieldAgentType,
  model: getFieldModel,
  temperature: getFieldTemperature,
  dialog_round: getFieldDialogRound,
  max_length_resp: getFieldMaxLengthResp,
  channel: getFieldChannel,
  input_type: getFieldInputType,
  input: getFieldInput,
  card_id: getCardId,
  stream_output: getStreamOutput,
  branch_name: getBranchName,
  node_type: getNodeType,
  hook_type: getHookType,
  hook_uri: getHookUri,
  agent_id: getAgentId,
  hook_resp_code: getHookRespCode,
  is_stream: getIsStream,
};
