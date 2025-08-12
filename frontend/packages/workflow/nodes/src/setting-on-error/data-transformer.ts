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

import {
  type ViewVariableTreeNode,
  type StandardNodeType,
} from '@coze-workflow/base';
import { type NodeContext } from '@flowgram-adapter/free-layout-editor';

import { formatModelData } from '../utils';
import { getOutputsWithErrorBody } from './utils/outputs';
import { getTimeoutConfig } from './utils/get-timeout-config';
import { isSettingOnErrorV2 } from './utils';
import {
  type SettingOnErrorDTO,
  SettingOnErrorProcessType,
  type SettingOnErrorExt,
  type NodeValueWithSettingOnErrorDTO,
  type NodeValueWithSettingOnErrorVO,
  type SettingOnErrorVO,
} from './types';

const formatExtOnInit = (ext: SettingOnErrorDTO['ext']) => {
  if (!ext) {
    return ext;
  }
  const llmParam = ext?.backupLLmParam;

  return {
    backupLLmParam: llmParam ? JSON.parse(llmParam) : undefined,
  };
};

const getDTOProcessType = (settingOnError?: SettingOnErrorDTO) =>
  settingOnError?.processType ||
  (settingOnError?.switch
    ? SettingOnErrorProcessType.RETURN
    : SettingOnErrorProcessType.BREAK);

const settingOnErrorInitV2 = (
  settingOnError?: SettingOnErrorDTO,
  context?: NodeContext,
  value?: NodeValueWithSettingOnErrorDTO,
) => {
  if (!isNodeContextV2(context)) {
    return {};
  }

  let timeoutMs = settingOnError?.timeoutMs;
  const timeoutConfig = getTimeoutConfig(context?.node);

  if (!timeoutMs) {
    // If no timeout is set and there is an initial value configuration, set the initial value
    // For example, the default of the LLM backend is 10min, the historical data needs to be set to 10min of init, and the newly added node displays the default default 3min.
    if (value && timeoutConfig?.init) {
      timeoutMs = timeoutConfig.init;
    } else {
      timeoutMs = timeoutConfig?.default;
    }
  }

  return {
    processType: getDTOProcessType(settingOnError),
    timeoutMs,
    retryTimes: settingOnError?.retryTimes ?? 0,
    ext: formatExtOnInit(settingOnError?.ext),
  };
};

const formatExtOnSave = (
  ext: SettingOnErrorExt | undefined,
  playgroundContext,
) => {
  if (!ext) {
    return ext;
  }
  const models = playgroundContext?.models || [];
  const llmParam = ext.backupLLmParam;
  const modelMeta = models.find(m => m.model_type === llmParam?.modelType);

  return {
    backupLLmParam: llmParam
      ? JSON.stringify(formatModelData(llmParam, modelMeta))
      : undefined,
  };
};

const settingOnErrorSaveV2 = (
  settingOnError: SettingOnErrorVO,
  context?: NodeContext,
) => {
  const playgroundContext = context?.playgroundContext;
  const res: Partial<SettingOnErrorDTO> = {
    processType:
      settingOnError?.processType ||
      (settingOnError?.settingOnErrorIsOpen
        ? SettingOnErrorProcessType.RETURN
        : undefined),
    timeoutMs: settingOnError?.timeoutMs,
    retryTimes: settingOnError?.retryTimes,
  };

  if (settingOnError?.retryTimes) {
    res.ext = formatExtOnSave(settingOnError?.ext, playgroundContext);
  }
  return res;
};

const isNodeContextV2 = (context?: NodeContext) =>
  isSettingOnErrorV2(context?.node?.flowNodeType as StandardNodeType);

export const settingOnErrorToVO = (
  settingOnError?: SettingOnErrorDTO,
  context?: NodeContext,
  value?: NodeValueWithSettingOnErrorDTO,
): SettingOnErrorVO => ({
  settingOnErrorIsOpen: settingOnError?.switch,
  settingOnErrorJSON: settingOnError?.dataOnErr,
  ...settingOnErrorInitV2(settingOnError, context, value),
});

export const settingOnErrorToDTO = (
  settingOnError?: SettingOnErrorVO,
  context?: NodeContext,
) => {
  if (!settingOnError) {
    return settingOnError;
  }

  return {
    switch: settingOnError?.settingOnErrorIsOpen,
    dataOnErr: settingOnError?.settingOnErrorJSON,
    ...(isNodeContextV2(context)
      ? settingOnErrorSaveV2(settingOnError, context)
      : {}),
  };
};

export const formatOutputsOnInit = (
  value?: NodeValueWithSettingOnErrorDTO,
  context?: NodeContext,
) => {
  const outputs = value?.outputs;
  const isV2 = isNodeContextV2(context);
  const isOpen = !!value?.inputs?.settingOnError?.switch;

  if (!outputs || !isSettingOnErrorV2 || !isOpen) {
    return;
  }

  const isBatch = !!value?.inputs?.batch?.batchEnable;
  return getOutputsWithErrorBody({
    value: outputs,
    isBatch,
    isOpen,
    isSettingOnErrorV2: isV2,
  });
};

export const settingOnErrorInit = (
  value?: NodeValueWithSettingOnErrorDTO,
  context?: NodeContext,
): {
  settingOnError?: SettingOnErrorVO;
  outputs?: ViewVariableTreeNode[];
} => {
  const outputs = formatOutputsOnInit(value, context);

  return {
    settingOnError: settingOnErrorToVO(
      value?.inputs?.settingOnError,
      context,
      value,
    ),
    ...(outputs ? { outputs } : {}),
  };
};

export const settingOnErrorSave = (
  value: NodeValueWithSettingOnErrorVO,
  context: NodeContext | undefined = undefined,
) => {
  const settingOnError = value?.settingOnError;
  if (value?.settingOnError) {
    delete value.settingOnError;
  }

  return {
    settingOnError: settingOnErrorToDTO(settingOnError, context),
  };
};
