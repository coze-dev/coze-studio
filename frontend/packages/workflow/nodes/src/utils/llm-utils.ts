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

import { mapValues, keyBy, snakeCase, isString, camelCase } from 'lodash-es';
import {
  GenerationDiversity,
  VariableTypeDTO,
  type InputValueDTO,
} from '@coze-workflow/base';
import { ModelParamType, type Model } from '@coze-arch/bot-api/developer_api';

import { DEFAULT_MODEL_TYPE } from '../constants';

const getDefaultModels = (modelMeta: Model): Record<string, unknown> => {
  const defaultModel: Record<string, unknown> = {};

  modelMeta?.model_params?.forEach(p => {
    const k = camelCase(p.name) as string;
    const { type } = p;

    // Priority to take the balance, custom bottom line
    const defaultValue =
      p.default_val[GenerationDiversity.Balance] ??
      p.default_val[GenerationDiversity.Customize];

    if (defaultValue !== undefined) {
      if (
        [ModelParamType.Float, ModelParamType.Int].includes(type) ||
        ['modelType'].includes(k)
      ) {
        defaultModel[k] = Number(defaultValue);
      }
    }
  });

  return defaultModel;
};

/**
 * Format model data to convert specific strings to numbers according to modelMeta
 * @param model
 * @param modelMeta
 * @returns
 */
export const formatModelData = (
  model: Record<string, unknown>,
  modelMeta: Model | undefined,
): Record<string, unknown> => {
  const modelParamMap = keyBy(modelMeta?.model_params ?? [], 'name');
  return mapValues(model, (value, key) => {
    const modelParam = modelParamMap[snakeCase(key)];
    if (!modelParam || !isString(value)) {
      return value;
    }

    const { type } = modelParam;

    if (
      [ModelParamType.Float, ModelParamType.Int].includes(type) ||
      ['modelType'].includes(key)
    ) {
      return Number(value);
    }

    return value;
  });
};

export const getDefaultLLMParams = (
  models: Model[],
): Record<string, unknown> => {
  const modelMeta =
    models.find(m => m.model_type === DEFAULT_MODEL_TYPE) ?? models[0];

  const llmParam = {
    modelType: modelMeta?.model_type,
    modelName: modelMeta?.name,
    generationDiversity: GenerationDiversity.Balance,
    ...getDefaultModels(modelMeta),
  };

  return llmParam;
};

export const reviseLLMParamPair = (d: InputValueDTO): [string, unknown] => {
  let k = d?.name || '';

  if (k === 'modleName') {
    k = 'modelName';
  }
  let v = d.input.value.content;
  if (
    [VariableTypeDTO.float, VariableTypeDTO.integer].includes(
      d.input.type as VariableTypeDTO,
    )
  ) {
    v = Number(d.input.value.content);
  }

  return [k, v];
};
