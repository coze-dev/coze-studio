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

import { type DatabaseCondition, ConditionLogic } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import {
  type FieldProps,
  FieldArray,
  Section,
  useWatch,
  FieldEmpty,
} from '@/form';

import { ConditionLogicField } from './condition-logic-field';
import { ConditionList } from './condition-list';
import { ConditionAddButton } from './condition-add-button';

type ConditionFieldProps = Pick<FieldProps, 'name' | 'label' | 'tooltip'> & {
  min?: number;
};

export function ConditionField({
  name,
  label,
  tooltip,
  min,
}: ConditionFieldProps) {
  const conditionListName = `${name}.conditionList`;
  const conditions = useWatch<DatabaseCondition[]>(conditionListName);

  return (
    <FieldArray name={conditionListName}>
      <Section title={label} tooltip={tooltip}>
        <div>
          <div className="flex">
            {conditions?.length > 1 && (
              <ConditionLogicField
                name={`${name}.logic`}
                defaultValue={ConditionLogic.AND}
                showStroke={true}
              />
            )}
            <div className="flex-1 min-w-0">
              <ConditionList min={min} />
            </div>
          </div>
          <FieldEmpty
            isEmpty={!conditions || conditions.length === 0}
            text={I18n.t('workflow_condition_empty')}
          />
          <ConditionAddButton />
        </div>
      </Section>
    </FieldArray>
  );
}
