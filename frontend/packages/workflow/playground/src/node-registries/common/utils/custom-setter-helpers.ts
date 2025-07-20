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
 
import { isNil } from 'lodash-es';
import { variableUtils } from '@coze-workflow/variable';
import { type ApiNodeDetailDTO } from '@coze-workflow/nodes';
import {
  ValueExpressionType,
  type ValueExpression,
  ViewVariableType,
} from '@coze-workflow/base';

/**
 * 获取自定义 setter 的值
 * @param value
 * @param field
 * @returns
 */
export const getCustomVal = (
  value: ValueExpression,
  // 通过 number 提取单个输入项的类型
  field: ApiNodeDetailDTO['inputs'][number],
) => {
  if (!field?.type) {
    return undefined;
  }

  if (value.type === ValueExpressionType.REF || value.content === undefined) {
    return undefined;
  }
  const fieldType = variableUtils.DTOTypeToViewType(field.type, {
    arrayItemType: field.schema?.type,
    assistType: field.schema?.assistType,
  });

  if ([ViewVariableType.Number, ViewVariableType.Integer].includes(fieldType)) {
    return Number(value.content);
  }

  if (ViewVariableType.Boolean === fieldType) {
    return Boolean(value.content) || value.content !== 'false';
  }

  return value.content;
};

/**
 * 根据plugin扩展协议， 获取自定义setter的属性
 */
export const getCustomSetterProps = (
  input: ApiNodeDetailDTO['inputs'][number],
) => {
  const {
    minimum,
    maximum,
    exclusiveMinimum,
    exclusiveMaximum,
    bizExtend,
    enum: inputEnum,
    enumVarNames,
    defaultValue,
  } = input || {};

  const isEnum = !!inputEnum;
  const isSlider = !isNil(minimum) && !isNil(maximum);

  // 例如这个插件：cutout（智能抠图）：store/plugin/7438917083918024738
  if (isEnum) {
    return {
      key: 'Select',
      optionList: inputEnum.map((item, index) => ({
        value: item,
        label: enumVarNames?.[index] || `${item}`,
      })),
      defaultValue,
    };
  }

  // 例如这个插件：change（调整）：store/plugin/7438921446090637312
  if (isSlider) {
    let step = 1;
    try {
      step = JSON.parse(bizExtend || '{}').step;
    } catch {
      return undefined;
    }
    const min = exclusiveMinimum ? minimum + step : minimum;
    const max = exclusiveMaximum ? maximum - step : maximum;
    return {
      key: 'Slider',
      min,
      max,
      step,
      defaultValue: defaultValue || min,
    };
  }
};
