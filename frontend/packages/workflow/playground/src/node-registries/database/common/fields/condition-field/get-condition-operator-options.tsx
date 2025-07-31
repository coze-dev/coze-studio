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

import { ViewVariableType } from '@coze-workflow/base';
import { type ConditionOperator } from '@coze-workflow/base';

import { ConditionOperatorMap } from '@/constants/condition-operator-map';

export function getConditionOperatorOptions(fieldType?: ViewVariableType) {
  let supportedOperators: ConditionOperator[] = [];

  if (
    fieldType === ViewVariableType.Number ||
    fieldType === ViewVariableType.Integer
  ) {
    supportedOperators = [
      'EQUAL',
      'NOT_EQUAL',
      'GREATER_THAN',
      'LESS_THAN',
      'GREATER_EQUAL',
      'LESS_EQUAL',
      'IN',
      'NOT_IN',
      'IS_NULL',
      'IS_NOT_NULL',
    ];
  }

  if (fieldType === ViewVariableType.String) {
    supportedOperators = [
      'EQUAL',
      'NOT_EQUAL',
      'LIKE',
      'NOT_LIKE',
      'IN',
      'NOT_IN',
      'IS_NULL',
      'IS_NOT_NULL',
    ];
  }

  if (fieldType === ViewVariableType.Time) {
    supportedOperators = [
      'EQUAL',
      'NOT_EQUAL',
      'GREATER_THAN',
      'LESS_THAN',
      'GREATER_EQUAL',
      'LESS_EQUAL',
      'IS_NULL',
      'IS_NOT_NULL',
    ];
  }

  if (fieldType === ViewVariableType.Boolean) {
    supportedOperators = [
      'EQUAL',
      'NOT_EQUAL',
      'IS_NULL',
      'IS_NOT_NULL',
      'BE_TRUE',
      'BE_FALSE',
    ];
  }

  return supportedOperators.map(operator => ({
    label: ConditionOperatorMap[operator].label,
    value: operator,
    operationIcon: ConditionOperatorMap[operator].operationIcon,
  }));
}
