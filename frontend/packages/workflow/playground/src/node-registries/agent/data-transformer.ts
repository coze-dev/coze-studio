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

import { get } from 'lodash-es';
import {
  type InputValueVO,
  type NodeDataDTO,
  VariableTypeDTO,
} from '@coze-workflow/base';

import { type AgentFormData, type AgentPlatformValue } from './types';
import {
  DEFAULT_RETRY_COUNT,
  DEFAULT_TIMEOUT,
  PLATFORM_OPTIONS,
} from './constants';

const DEFAULT_PLATFORM: AgentPlatformValue =
  PLATFORM_OPTIONS.find(option => option.available)?.value ?? 'hiagent';

const EMPTY_NODE_DATA: NodeDataDTO = {
  inputs: {},
  nodeMeta: {
    description: '',
    icon: '',
    subTitle: '',
    title: '',
    mainColor: '',
  },
  outputs: [],
};

const extractQuery = (rawQuery: unknown): string => {
  if (typeof rawQuery === 'string') {
    return rawQuery;
  }
  if (rawQuery && typeof rawQuery === 'object') {
    const value = get(rawQuery, 'value.content');
    return typeof value === 'string' ? value : '';
  }
  return '';
};

const isAgentPlatformValue = (value: unknown): value is AgentPlatformValue =>
  PLATFORM_OPTIONS.some(option => option.value === value);

const isInputValueVOArray = (value: unknown): value is InputValueVO[] =>
  Array.isArray(value);

const buildInputs = (
  rawInputs: NodeDataDTO['inputs'],
): AgentFormData['inputs'] => {
  const platform = isAgentPlatformValue(rawInputs.platform)
    ? rawInputs.platform
    : DEFAULT_PLATFORM;
  const agentUrl =
    typeof rawInputs.agent_url === 'string' ? rawInputs.agent_url : '';
  const agentKey =
    typeof rawInputs.agent_key === 'string' ? rawInputs.agent_key : '';
  const timeout =
    typeof rawInputs.timeout === 'number' ? rawInputs.timeout : DEFAULT_TIMEOUT;
  const retryCount =
    typeof rawInputs.retry_count === 'number'
      ? rawInputs.retry_count
      : DEFAULT_RETRY_COUNT;
  const dynamicInputs = isInputValueVOArray(rawInputs.dynamicInputs)
    ? rawInputs.dynamicInputs
    : [];

  return {
    ...rawInputs,
    platform,
    agent_url: agentUrl,
    agent_key: agentKey,
    query: extractQuery(rawInputs.query),
    dynamicInputs,
    timeout,
    retry_count: retryCount,
  };
};

export const transformOnInit = (value?: NodeDataDTO): AgentFormData => {
  const baseNodeData = value ?? EMPTY_NODE_DATA;
  const normalizedInputs = buildInputs(baseNodeData.inputs);

  const normalizedNode: AgentFormData = {
    ...baseNodeData,
    inputs: normalizedInputs,
  };

  return normalizedNode;
};

export const transformOnSubmit = (formData: AgentFormData): NodeDataDTO => {
  const { inputs, ...rest } = formData;
  const {
    agent_url,
    agent_key,
    query,
    dynamicInputs,
    timeout,
    retry_count,
    platform,
    ...otherInputs
  } = inputs;

  const trimmedUrl = agent_url.trim();
  const trimmedKey = agent_key?.trim() ?? '';
  const trimmedQuery = query.trim();

  const nextInputs: Record<string, unknown> = {
    ...otherInputs,
    platform,
    agent_url: trimmedUrl,
    dynamicInputs: Array.isArray(dynamicInputs) ? dynamicInputs : [],
    timeout: Number.isFinite(timeout) ? timeout : DEFAULT_TIMEOUT,
    retry_count: Number.isFinite(retry_count)
      ? retry_count
      : DEFAULT_RETRY_COUNT,
    query: {
      type: VariableTypeDTO.string,
      value: {
        type: 'literal',
        content: trimmedQuery,
      },
    },
  };

  if (trimmedKey) {
    nextInputs.agent_key = trimmedKey;
  }

  return {
    ...rest,
    inputs: nextInputs,
  };
};
