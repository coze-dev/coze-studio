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
  type Model,
  ModelFuncConfigType,
  ModelFuncConfigStatus,
} from '@coze-arch/bot-api/developer_api';

export type ModelCapabilityConfig = {
  [key in ModelFuncConfigType]: [
    configStatus: ModelFuncConfigStatus,
    modelName: string,
  ];
};

export type TGetModelCapabilityConfig = (params: {
  modelIds: string[];
  getModelById: (id: string) => Model | undefined;
}) => ModelCapabilityConfig;

// Fallback of model capability configuration, capability without configuration is handled as supported
export const defaultModelCapConfig = Object.values(ModelFuncConfigType).reduce(
  (res, type) => ({
    ...res,
    [type]: [
      ModelFuncConfigStatus.FullSupport,
      '',
    ] satisfies ModelCapabilityConfig[ModelFuncConfigType],
  }),
  {},
) as ModelCapabilityConfig;

export const mergeModelFuncConfigStatus = (
  ...values: ModelFuncConfigStatus[]
) => Math.max(...values);

const mergeModelCapabilityConfig = (
  src: ModelCapabilityConfig,
  target: Model['func_config'],
  targetName: string,
) =>
  target
    ? Object.entries(target).reduce<ModelCapabilityConfig>(
        (merged, [key, status]) => {
          // Unconfigured capabilities are considered fully supported
          const [preStatus, preName] = merged[
            key as unknown as ModelFuncConfigType
          ] ?? [ModelFuncConfigStatus.FullSupport, []];
          const mergedStatus = mergeModelFuncConfigStatus(preStatus, status);
          return {
            ...merged,
            [key]: [
              mergedStatus,
              mergedStatus === preStatus ? preName : targetName,
            ],
          };
        },
        src,
      )
    : src;

export const getMultiAgentModelCapabilityConfig: TGetModelCapabilityConfig = ({
  getModelById,
  modelIds,
}) =>
  Array.from(modelIds).reduce((res, modelId) => {
    const model = getModelById(modelId);
    if (model?.func_config) {
      return mergeModelCapabilityConfig(
        res,
        model.func_config,
        model.name ?? '',
      );
    }
    return res;
  }, defaultModelCapConfig);

export const getSingleAgentModelCapabilityConfig: TGetModelCapabilityConfig = ({
  getModelById,
  modelIds,
}) => {
  const model = getModelById(modelIds.at(0) ?? '');
  return mergeModelCapabilityConfig(
    defaultModelCapConfig,
    model?.func_config,
    model?.name ?? '',
  );
};
