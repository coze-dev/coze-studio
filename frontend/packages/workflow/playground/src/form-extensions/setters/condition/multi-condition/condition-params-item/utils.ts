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

// If the lvalue type has changed, empty the rvalue; if the lvalue type has not changed, keep the rvalue
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

  // If there is no variable selected on the left side, select the variable under the new operation, and clear the value of operator and right
  if (!oldSourceType && newSourceType) {
    return others;
  }

  // When a primitive type exists, it is not empty
  if (oldSourceType && oldSourceType !== newSourceType) {
    return others;
  } else {
    return { ...newData };
  }
};

// If the operator does not require an rvalue (isTrue, isEmpty), then empty the rvalue
// If the rvalue type does not match after the operator switch, clear the rvalue
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

// If the lvalue is boolean, add a default value of false when the rvalue selection type is literal
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
   * Whether to use a type compatible with old data, called when operator switches, set to false
   */
  useCompatibleType?: boolean;
}): ViewVariableType[] => {
  const compareLength =
    operator && COMPARE_LENGTH_CONDITION_TYPES.includes(operator);

  /**
   * Array addition
   * "Length greater than, length greater than or equal to, length less than, length less than or equal to", rvalue only supports int type.
   * "Included, not included", rvalues follow based on the type of lvalues.
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
   * String: "Length greater than, length greater than or equal to, length less than, length less than or equal to" (rvalue only supports int, string)
   * Historical data, the Str type is displayed by default.
   * New data, default to int type.
   */
  if (sourceType === ViewVariableType.String) {
    if (compareLength) {
      // Compatible conditions are: str > rightValue scenarios, the rvalue of the stock data is string type, and the rvalue is displayed as string type by default
      if (rightValue && useCompatibleType) {
        const rawMetaType = rightValue.rawMeta?.type as
          | ViewVariableType
          | undefined;

        // There is a raw meta type, the raw meta type is preferred
        if (rawMetaType) {
          return [
            rawMetaType !== ViewVariableType.Integer
              ? ViewVariableType.String
              : ViewVariableType.Integer,
          ];
        }
        // If it is a literal, it is determined according to the literal content type
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
