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
  type ViewVariableType,
  type DatabaseConditionOperator,
  useNodeTestId,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';

import { withField, useField, Select } from '@/form';

import { getConditionOperatorOptions } from './get-condition-operator-options';

interface ConditionOperatorFieldProps {
  dataType?: ViewVariableType;
}

export const ConditionOperatorField = withField(
  ({ dataType }: ConditionOperatorFieldProps) => {
    const { name, value, onChange, readonly } =
      useField<DatabaseConditionOperator>();
    const options = getConditionOperatorOptions(dataType);

    const { getNodeSetterId } = useNodeTestId();

    return (
      <Select
        className="w-[42px]"
        data-testid={getNodeSetterId(name)}
        value={value}
        disabled={readonly}
        onChange={newValue => {
          onChange(newValue as DatabaseConditionOperator);
        }}
        optionList={options}
        placeholder={I18n.t('workflow_detail_condition_pleaseselect')}
        renderSelectedItem={optionsNode => (
          <Tooltip content={optionsNode.label}>
            <div className={'flex items-center h-[24px]'}>
              {optionsNode.operationIcon}
            </div>
          </Tooltip>
        )}
      />
    );
  },
);
