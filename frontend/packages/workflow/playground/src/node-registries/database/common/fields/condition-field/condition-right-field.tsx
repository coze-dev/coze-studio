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
  type DatabaseConditionRight,
  type DatabaseConditionOperator,
  type ViewVariableType,
} from '@coze-workflow/base';
import { Input } from '@coze-arch/coze-design';

import { ValueExpressionInput } from '@/nodes-v2/components/value-expression-input';
import { withField, useField } from '@/form';

interface ConditionRightFieldProps {
  operation?: DatabaseConditionOperator;
  dataType?: ViewVariableType;
}

export const ConditionRightField = withField(
  ({ operation, dataType }: ConditionRightFieldProps) => {
    const { name, value, onChange, readonly } =
      useField<DatabaseConditionRight>();

    if (operation === 'IS_NULL' || operation === 'IS_NOT_NULL') {
      return <Input value={'empty'} disabled size="small" />;
    }

    if (operation === 'BE_TRUE') {
      return <Input value={'true'} disabled size="small" />;
    }

    if (operation === 'BE_FALSE') {
      return <Input value={'false'} disabled size="small" />;
    }

    return (
      <ValueExpressionInput
        name={name}
        value={value}
        inputType={dataType}
        readonly={readonly}
        onChange={newValue => {
          onChange(newValue as DatabaseConditionRight);
        }}
      />
    );
  },
);
