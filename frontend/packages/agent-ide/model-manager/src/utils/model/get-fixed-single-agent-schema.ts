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

import { cloneDeep, isObject } from 'lodash-es';
import { type ISchema } from '@formily/react';
import { I18n } from '@coze-arch/i18n';

import { ModelFormComponent } from '../../constant/model-form-component';
import { type ModelFormComponentPropsMap } from '../../components/model-form/type';

export const getFixedSingleAgentSchema = (schema: ISchema): ISchema => {
  const clonedSchema = cloneDeep(schema);
  const { properties } = clonedSchema;
  if (!properties || typeof properties === 'string') {
    return clonedSchema;
  }
  Object.entries(properties).forEach(([classId, voidField]) => {
    if (!isObject(voidField)) {
      return;
    }

    if (!voidField.properties) {
      return;
    }
    if (classId !== '2') {
      return;
    }

    const decoratorProps: ModelFormComponentPropsMap[ModelFormComponent.ModelFormItem] =
      {
        label: I18n.t('model_config_history_round'),
        popoverContent: I18n.t('model_config_history_round_explain'),
      };
    const componentProps: ModelFormComponentPropsMap[ModelFormComponent.SliderInputNumber] =
      {
        step: 1,
        max: 100,
        min: 0,
        decimalPlaces: 0,
      };
    const historyRoundFiled: ISchema = {
      type: 'number',
      'x-component': ModelFormComponent.SliderInputNumber,
      'x-decorator': ModelFormComponent.ModelFormItem,
      'x-component-props': componentProps,
      'x-decorator-props': decoratorProps,
      'x-index': 0,
    };
    Object.assign(voidField.properties, {
      HistoryRound: historyRoundFiled,
    });
  });
  return clonedSchema;
};
