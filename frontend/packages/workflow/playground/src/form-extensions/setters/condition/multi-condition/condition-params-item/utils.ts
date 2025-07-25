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
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowVariableService,
  ValueExpressionType,
  ViewVariableType,
  variableUtils,
} from '@coze-workflow/variable';
import { ConditionType } from '@coze-workflow/base/api';
import { ValueExpression } from '@coze-workflow/base';

import { type InputType } from '@/form-extensions/components/value-expression-input/InputField';

import { type ConditionItem } from '../types';

export const DISABLED_CONDITION_TYPES = [
  ConditionType.Null,
  ConditionType.NotNull,
  ConditionType.True,
  ConditionType.False,
];

export const COMPARE_LENGTH_CONDITION_TYPES = [
  ConditionType.LengthGt,
  ConditionType.LengthGtEqual,
  ConditionType.LengthLt,
  ConditionType.LengthLtEqual,
];

export const calcComparisonDisabled = (operator: ConditionType | undefined) => {
  if (!operator) {
    return false;
  }

  return DISABLED_CONDITION_TYPES.includes(operator);
};

// 如果左值类型发生了变化，清空右值的值；如果左值类型没有变化，保留右值
export const processLeftSourceTypeChange = (
  oldData: ConditionItem,
  newData: ConditionItem,
  workflowVariableService: WorkflowVariableService,
  node: FlowNodeEntity,
  // eslint-disable-next-line max-params
) => {
  const oldSourceType = workflowVariableService.getWorkflowVariableByKeyPath(
    oldData.left?.content?.keyPath,
    { node },
  )?.viewType;

  const newSourceType = workflowVariableService.getWorkflowVariableByKeyPath(
    newData.left?.content?.keyPath,
    { node },
  )?.viewType;

  const { right, operator, ...others } = newData;

  // 如果原来左边没有选择变量，新的操作下选了变量，清空operator及right 的值
  if (!oldSourceType && newSourceType) {
    return others;
  }

  // 原始类型存在时，不清空
  if (oldSourceType && oldSourceType !== newSourceType) {
    return others;
  } else {
    return { ...newData };
  }
};

// 如果操作符不需要右值（isTrue, isEmpty)，那么清空右值
// 如果操作符切换后右值类型不匹配，清空右值
export const processConditionData = (
  oldData: ConditionItem,
  newData: ConditionItem,
  workflowVariableService: WorkflowVariableService,
  node: FlowNodeEntity,
  // eslint-disable-next-line max-params
) => {
  if (!newData.operator) {
    return { ...newData };
  }

  const { right, ...others } = newData;

  if (right && newData.operator !== oldData.operator) {
    const newSourceType = workflowVariableService.getWorkflowVariableByKeyPath(
      newData.left?.content?.keyPath,
      { node },
    )?.viewType;
    const requiredRightInputType = getRightValueInputType({
      rightValue: right,
      sourceType: newSourceType,
      operator: newData.operator,
      useCompatibleType: false,
    });
    const rightInputType = variableUtils.getValueExpressionViewType(
      right,
      workflowVariableService,
      { node },
    );
    if (rightInputType && !requiredRightInputType?.includes(rightInputType)) {
      return others;
    }
  }
  if (DISABLED_CONDITION_TYPES.includes(newData.operator)) {
    return others;
  } else {
    return { ...newData };
  }
};

// 如果左值为 boolean，当右值选择类型为 literal 时，补充一个 false 的默认值
export const processRightDefaultValue = (
  sourceType: ViewVariableType | undefined,
  data: ConditionItem,
) => {
  const { right, ...others } = data;
  if (
    sourceType === ViewVariableType.Boolean ||
    sourceType === ViewVariableType.ArrayBoolean
  ) {
    if (right?.type === ValueExpressionType.LITERAL && isNil(right.content)) {
      const newRight: ValueExpression = {
        ...right,
        content: false,
      };

      right.rawMeta = { type: ViewVariableType.Boolean };
      return {
        ...others,
        right: newRight,
      };
    } else {
      return {
        ...data,
      };
    }
  } else {
    return {
      ...data,
    };
  }
};

const getInputTypeFromArrayLikeSourceTypeAndOperation = (
  operation: ConditionType | undefined,
) => {
  const restrictOperationInputTypeMap = new Map<
    ConditionType | undefined,
    InputType
  >([
    [ConditionType.LengthGt, ViewVariableType.Number],
    [ConditionType.LengthGtEqual, ViewVariableType.Number],
    [ConditionType.LengthLt, ViewVariableType.Number],
    [ConditionType.LengthLtEqual, ViewVariableType.Number],
  ]);
  return restrictOperationInputTypeMap.get(operation);
};

export const getRightValueInputType = ({
  rightValue,
  sourceType,
  operator,
  useCompatibleType,
}: {
  rightValue?: ValueExpression;
  sourceType?: ViewVariableType;
  operator?: ConditionType;
  /**
   * 是否使用兼容旧数据的类型，在 operator 切换时调用，设置为 false
   */
  useCompatibleType?: boolean;
}): ViewVariableType[] => {
  const compareLength =
    operator && COMPARE_LENGTH_CONDITION_TYPES.includes(operator);

  /**
   * 数组新增
   * “长度大于、长度大于等于、长度小于、长度小于等于”，右值仅支持int类型。
   * “包含、不包含”，右值基于左值的类型进行跟随。
   */
  if (sourceType && ViewVariableType.isArrayType(sourceType)) {
    if (compareLength) {
      return [ViewVariableType.Integer];
    }
    if (
      operator &&
      [ConditionType.Contains, ConditionType.NotContains].includes(operator)
    ) {
      return [ViewVariableType.getArraySubType(sourceType), sourceType];
    }
  }

  /**
   * 字符串：“长度大于、长度大于等于、长度小于、长度小于等于”（右值仅支持int、string）
   * 历史数据，默认显示Str类型。
   * 新数据，默认为int类型。
   */
  if (sourceType === ViewVariableType.String) {
    if (compareLength) {
      // 兼容 condition 为：str > rightValue 的场景，存量数据右值为 string 类型，右值默认显示为 string 类型
      if (rightValue && useCompatibleType) {
        const rawMetaType = rightValue.rawMeta?.type as
          | ViewVariableType
          | undefined;

        // 存在 raw meta 类型，优先使用 raw meta 类型
        if (rawMetaType) {
          return [
            rawMetaType !== ViewVariableType.Integer
              ? ViewVariableType.String
              : ViewVariableType.Integer,
          ];
        }
        // 如果是字面量，根据字面量 content 类型决定
        if (
          !ValueExpression.isEmpty(rightValue) &&
          ValueExpression.isLiteral(rightValue)
        ) {
          return typeof rightValue.content === 'string'
            ? [ViewVariableType.String]
            : [ViewVariableType.Integer];
        }
      }
      return [ViewVariableType.Integer];
    }
    return [ViewVariableType.String];
  }

  const sourceTypeInputTypeMap = new Map<
    ViewVariableType | undefined,
    ViewVariableType[]
  >([
    [ViewVariableType.String, [ViewVariableType.String]],
    [
      ViewVariableType.Integer,
      [ViewVariableType.Integer, ViewVariableType.Number],
    ],
    [
      ViewVariableType.Number,
      [ViewVariableType.Number, ViewVariableType.Integer],
    ],
    [ViewVariableType.Boolean, [ViewVariableType.Boolean]],
    [ViewVariableType.Object, [ViewVariableType.String]],
  ]);
  return sourceTypeInputTypeMap.get(sourceType) || [ViewVariableType.String];
};

export const getInputTypeFromSourceTypeAndOperation = (
  sourceType: ViewVariableType | undefined,
  operation: ConditionType | undefined,
): InputType => {
  if (sourceType && ViewVariableType.isArrayType(sourceType)) {
    const arrayLikeStrictInputType =
      getInputTypeFromArrayLikeSourceTypeAndOperation(operation);
    if (arrayLikeStrictInputType) {
      return arrayLikeStrictInputType;
    }
  }

  const sourceTypeInputTypeMap = new Map<
    ViewVariableType | undefined,
    InputType
  >([
    [ViewVariableType.String, ViewVariableType.String],
    [ViewVariableType.Integer, ViewVariableType.Number],
    [ViewVariableType.Number, ViewVariableType.Number],
    [ViewVariableType.Boolean, ViewVariableType.Boolean],
    [ViewVariableType.Object, ViewVariableType.String],
    [ViewVariableType.ArrayBoolean, ViewVariableType.Boolean],
    [ViewVariableType.ArrayInteger, ViewVariableType.Number],
    [ViewVariableType.ArrayNumber, ViewVariableType.Number],
    [ViewVariableType.ArrayObject, ViewVariableType.String],
    [ViewVariableType.ArrayString, ViewVariableType.String],
  ]);

  return sourceTypeInputTypeMap.get(sourceType) || ViewVariableType.String;
};
