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

import { type Model } from '@coze-arch/bot-api/developer_api';

import { type ModelPresetValues } from '../type';
import { convertModelValueType } from '../../utils/model/convert-model-value-type';

export const getModelPresetValues = ({
  model_params: modelParams,
}: Required<Pick<Model, 'model_params'>>): ModelPresetValues => {
  const presetValues: Required<ModelPresetValues> = {
    defaultValues: {},
    creative: {},
    precise: {},
    balance: {},
  };
  modelParams.forEach(param => {
    const { default_val: paramPresetValues, name, type } = param;

    const defaultValue = paramPresetValues.default_val;
    const creativeValue = paramPresetValues.creative;
    const balanceValue = paramPresetValues.balance;
    const preciseValue = paramPresetValues.precise;

    presetValues.defaultValues[name] = convertModelValueType(
      defaultValue,
      type,
    );
    if (creativeValue) {
      const convertedCreativeValue = convertModelValueType(creativeValue, type);
      presetValues.creative[name] = convertedCreativeValue;
    }
    if (balanceValue) {
      const convertedBalanceValue = convertModelValueType(balanceValue, type);
      presetValues.balance[name] = convertedBalanceValue;
    }
    if (preciseValue) {
      const convertedPreciseValue = convertModelValueType(preciseValue, type);
      presetValues.precise[name] = convertedPreciseValue;
    }
  });
  return presetValues;
};
