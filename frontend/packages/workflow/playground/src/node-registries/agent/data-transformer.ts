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
import { nanoid } from 'nanoid';
import { type NodeFormContext } from '@flowgram-adapter/free-layout-editor';
import { variableUtils } from '@coze-workflow/variable';
import {
  ValueExpressionType,
  ViewVariableType,
  type InputValueDTO,
  type InputValueVO,
  type NodeDataDTO,
  VariableTypeDTO,
} from '@coze-workflow/base';

import { type AgentFormData, type AgentPlatformValue } from './types';
import {
  DEFAULT_PLATFORM,
  DEFAULT_RETRY_COUNT,
  DEFAULT_TIMEOUT,
  PLATFORM_OPTIONS,
} from './constants';

const EMPTY_NODE_DATA: NodeDataDTO = {
  inputs: {},
  nodeMeta: {
    description: '',
    icon: 'icon-Agent-v2.png',
    subTitle: '',
    title: 'Agent',
    mainColor: '',
  },
  outputs: [],
};

const extractQueryLiteral = (rawQuery: unknown): string => {
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
  const agentBindingId =
    typeof rawInputs.agent_binding_id === 'string'
      ? rawInputs.agent_binding_id
      : undefined;
  const agentId =
    typeof rawInputs.agent_id === 'string' ? rawInputs.agent_id : undefined;
  const agentName =
    typeof rawInputs.agent_name === 'string' ? rawInputs.agent_name : undefined;
  const agentMetadata = rawInputs.agent_metadata ?? undefined;
  const timeout =
    typeof rawInputs.timeout === 'number' ? rawInputs.timeout : DEFAULT_TIMEOUT;
  const retryCount =
    typeof rawInputs.retry_count === 'number'
      ? rawInputs.retry_count
      : DEFAULT_RETRY_COUNT;
  return {
    ...rawInputs,
    platform,
    agent_url: agentUrl,
    agent_key: agentKey,
    agent_binding_id: agentBindingId,
    agent_id: agentId,
    agent_name: agentName,
    agent_metadata: agentMetadata,
    query: extractQueryLiteral(rawInputs.query),
    timeout,
    retry_count: retryCount,
  };
};

const createQueryParamVO = (
  query: InputValueVO | undefined,
  fallback: string,
): InputValueVO => ({
  name: 'query',
  key: query?.key ?? nanoid(),
  input:
    query?.input && Object.keys(query.input).length
      ? query.input
      : {
          type: ValueExpressionType.LITERAL,
          content: fallback,
        },
});

const isPresent = <T>(value: T | undefined | null): value is T => Boolean(value);

const convertInputParametersToVO = (
  value: AgentFormData | NodeDataDTO | undefined,
  context: NodeFormContext,
): { query: InputValueVO; others: InputValueVO[] } => {
  const rawList = (value?.inputs?.inputParameters ?? []) as InputValueDTO[];
  const { variableService } = context.playgroundContext;

  const voList = rawList
    .map(param => variableUtils.inputValueToVO(param, variableService))
    .filter(isPresent);

  const queryFromExisting = voList.find(item => item.name === 'query');
  const queryLiteral = extractQueryLiteral(value?.inputs?.query);
  const ensuredQuery = createQueryParamVO(queryFromExisting, queryLiteral);

  const others = voList.filter(item => item.name !== 'query');
  return { query: ensuredQuery, others };
};

const convertDynamicInputsToVO = (
  value: unknown,
  context: NodeFormContext,
): InputValueVO[] => {
  const list = Array.isArray(value) ? value : [];
  const { variableService } = context.playgroundContext;
  return list
    .map(item => {
      if (!item || typeof item !== 'object') {
        return undefined;
      }
      const maybeDTO = item as InputValueDTO;
      if (maybeDTO.input && 'value' in maybeDTO.input) {
        return variableUtils.inputValueToVO(maybeDTO, variableService);
      }
      const maybeVO = item as InputValueVO;
      if (maybeVO.input) {
        return {
          ...maybeVO,
          key: maybeVO.key ?? nanoid(),
        };
      }
      return undefined;
    })
    .filter(isPresent);
};

export const transformOnInit = (
  value: NodeDataDTO | undefined,
  context: NodeFormContext,
): AgentFormData => {
  const baseNodeData = value ?? EMPTY_NODE_DATA;
  const rawInputs = baseNodeData.inputs ?? {};
  const normalizedInputs = buildInputs(rawInputs);
  const { query: queryParam, others: paramOthers } =
    convertInputParametersToVO(baseNodeData, context);
  const dynamicFromConfig = convertDynamicInputsToVO(
    rawInputs.dynamicInputs,
    context,
  );
  const dynamicInputs = paramOthers.length > 0 ? paramOthers : dynamicFromConfig;
  const outputs =
    baseNodeData.outputs && baseNodeData.outputs.length > 0
      ? baseNodeData.outputs
      : [
          {
            key: nanoid(),
            name: 'answer',
            type: ViewVariableType.String,
          },
        ];
  const nodeMeta = {
    ...EMPTY_NODE_DATA.nodeMeta,
    ...(baseNodeData.nodeMeta ?? {}),
    title: baseNodeData.nodeMeta?.title || 'Agent',
    icon: baseNodeData.nodeMeta?.icon || 'icon-Agent-v2.png',
  };


  const normalizedNode: AgentFormData = {
    ...baseNodeData,
    inputs: {
      ...normalizedInputs,
      inputParameters: [queryParam],
      dynamicInputs,
      agent_binding_id: normalizedInputs.agent_binding_id,
      agent_id: normalizedInputs.agent_id,
      agent_name: normalizedInputs.agent_name,
      agent_metadata: normalizedInputs.agent_metadata,
    },
    nodeMeta,
    outputs,
  };

  return normalizedNode;
};

export const transformOnSubmit = (
  formData: AgentFormData,
  context: NodeFormContext,
): NodeDataDTO => {
  const { variableService } = context.playgroundContext;
  const { node } = context;

  const { inputs, ...rest } = formData;
  const {
    agent_url,
    agent_key,
    query,
    dynamicInputs,
    timeout,
    retry_count,
    platform,
    inputParameters = [],
    ...otherInputs
  } = inputs;

  const trimmedUrl = agent_url.trim();
  const trimmedKey = agent_key?.trim() ?? '';
  const trimmedQuery = query.trim();

  const inputParametersDTO = (inputParameters ?? [])
    .map(param =>
      variableUtils.inputValueToDTO(param, variableService, { node }),
    )
    .filter(Boolean) as InputValueDTO[];

  const queryParamDTO = inputParametersDTO.find(param => param.name === 'query');
  const queryDTO = queryParamDTO?.input ?? {
    type: VariableTypeDTO.string,
    value: {
      type: 'literal',
      content: trimmedQuery,
    },
  };

  const dynamicInputsDTO = (dynamicInputs ?? [])
    .map(input =>
      variableUtils.inputValueToDTO(input, variableService, { node }),
    )
    .filter(Boolean) as InputValueDTO[];

  const nextInputs: Record<string, unknown> = {
    ...otherInputs,
    platform,
    agent_url: trimmedUrl,
    agent_key: trimmedKey,
    dynamicInputs: dynamicInputsDTO,
    timeout: Number.isFinite(timeout) ? timeout : DEFAULT_TIMEOUT,
    retry_count: Number.isFinite(retry_count)
      ? retry_count
      : DEFAULT_RETRY_COUNT,
    query: queryDTO,
    inputParameters: inputParametersDTO,
  };

  if (trimmedKey) {
    nextInputs.agent_key = trimmedKey;
  }

  return {
    ...rest,
    inputs: nextInputs,
  };
};
