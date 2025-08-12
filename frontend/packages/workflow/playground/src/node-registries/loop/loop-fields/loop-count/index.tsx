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
  useNodeTestId,
  type ValueExpression,
  ValueExpressionType,
  ViewVariableType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { ValueExpressionInput } from '@/form-extensions/components/value-expression-input';
import { FormItem } from '@/form-extensions/components/form-item';
import { useField, withField } from '@/form';

import { useLoopType } from '../../hooks';
import { LoopType } from '../../constants';

interface LoopCountFieldProps {
  title?: string;
  tooltip?: string;
  testId?: string;
}

export const LoopCountField = withField<LoopCountFieldProps, ValueExpression>(
  ({
    title = I18n.t('workflow_loop_count'),
    tooltip = I18n.t('workflow_loop_count_tooltips'),
    testId,
  }) => {
    const { value, onChange, readonly } = useField<ValueExpression>();
    const { getNodeSetterId } = useNodeTestId();
    const loopType = useLoopType();

    if (loopType !== LoopType.Count) {
      return null;
    }

    return (
      <FormItem
        label={title}
        tooltip={tooltip}
        layout="vertical"
        style={{
          marginTop: 12,
        }}
        labelStyle={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--coz-fg-secondary, rgba(6, 7, 9, 0.50))',
        }}
      >
        <ValueExpressionInput
          value={value}
          onChange={onChange}
          testId={testId ?? getNodeSetterId('loopCount')}
          disabledTypes={ViewVariableType.getComplement([
            ViewVariableType.Integer,
          ])}
          readonly={readonly}
          inputType={ViewVariableType.Integer}
          literalConfig={{
            min: 1,
            max: 1000,
          }}
          literalStyle={{
            width: '100%',
          }}
        />
      </FormItem>
    );
  },
  {
    defaultValue: { type: ValueExpressionType.LITERAL, content: 10 },
  },
);
