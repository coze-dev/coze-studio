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

import { type FC } from 'react';

import {
  ConditionType,
  ValueExpressionType,
  type ValueExpression,
} from '@coze-workflow/base';

import { VariableDisplay } from './variable-display';
import { ConditionTag } from './condition-tag';

const specialValueMap = {
  [ConditionType.Null]: 'Empty',
  [ConditionType.NotNull]: 'Empty',
  [ConditionType.True]: 'true',
  [ConditionType.False]: 'false',
};

export const ExpressionDisplay: FC<{
  value?: ValueExpression;
  operator?: ConditionType;
}> = ({ value, operator }) => {
  if (
    [
      ConditionType.Null,
      ConditionType.NotNull,
      ConditionType.True,
      ConditionType.False,
    ].includes(operator as ConditionType)
  ) {
    return (
      <ConditionTag>{specialValueMap[operator as ConditionType]}</ConditionTag>
    );
  }
  if (!value || value?.type === ValueExpressionType.OBJECT_REF) {
    return null;
  }
  if (value?.type === ValueExpressionType.LITERAL) {
    if (Array.isArray(value.content)) {
      return (
        <ConditionTag tooltip={value.content.join(', ')}>
          {value.content.join(', ')}
        </ConditionTag>
      );
    } else {
      return (
        <ConditionTag tooltip={String(value.content)}>
          {String(value.content)}
        </ConditionTag>
      );
    }
  } else {
    return <VariableDisplay keyPath={value?.content?.keyPath} />;
  }
};
