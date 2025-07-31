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

import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { Port } from './port';
import { Field } from './field';
import { ConditionBranch } from './condition-branch';

export function Conditions() {
  const { data } = useWorkflowNode();
  const conditions = data?.condition;

  return (
    <>
      {conditions?.map((condition, index) => {
        let label = I18n.t('worklfow_condition_if', {}, 'If');

        if (index > 0) {
          label = I18n.t('worklfow_condition_else_if', {}, 'Else if');
        }

        return (
          <Field label={label}>
            <ConditionBranch branch={condition.condition} />
            <Port id={calcPortId(index)} type="output" />
          </Field>
        );
      })}
      <Field label={I18n.t('workflow_detail_condition_else')}>
        <div className="h-8 coz-stroke-plus coz-bg-max border border-solid p-1 rounded-mini" />
        <Port id={'false'} type="output" />
      </Field>
    </>
  );
}

function calcPortId(index: number) {
  if (index === 0) {
    return 'true';
  } else {
    return `true_${index}`;
  }
}
