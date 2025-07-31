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

import { cloneDeep } from 'lodash-es';
import {
  ModelParamType,
  type ModelParameter,
} from '@coze-arch/bot-api/developer_api';
import { convertModelValueType } from '@coze-agent-ide/bot-editor-context-store';

export const getFixedModelFormValues = (
  values: Record<string, unknown>,
  modelParameterList: ModelParameter[],
) => {
  const draft = cloneDeep(values);

  Object.keys(draft).forEach(key => {
    const targetParameter = modelParameterList.find(
      parameter => parameter.name === key,
    );
    if (!targetParameter) {
      return;
    }
    const value = draft[key];
    const parameterType = targetParameter.type;
    const { options } = targetParameter;

    // Fixed that parameters of type enumeration are not in the scope of enumeration
    // IDL cannot write paradigm, converted to string comparison
    if (options?.length) {
      if (options.findIndex(option => option.value === String(value)) >= 0) {
        return;
      }
      draft[key] = convertModelValueType(
        options.at(0)?.value ?? '',
        parameterType,
      );
    }

    // Fixed number type parameters exceeding maximum and minimum values
    if (
      parameterType === ModelParamType.Float ||
      parameterType === ModelParamType.Int
    ) {
      if (typeof value !== 'number') {
        return;
      }

      const { max, min } = targetParameter;

      const numberedMax = Number(max);
      const numberedMin = Number(min);
      if (max && value > numberedMax) {
        draft[key] = numberedMax;
      }
      if (min && value < numberedMin) {
        draft[key] = numberedMin;
      }
    }
  });
  return draft;
};
