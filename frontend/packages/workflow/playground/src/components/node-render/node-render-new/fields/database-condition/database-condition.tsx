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

import { ConditionContainer } from '../../components/condition';
import { Field } from '..';
import { useConditions } from './use-conditions';
import { DatabaseConditionRightComponent } from './database-condition-right';
import { DatabaseConditionOperatorComponent } from './database-condition-operator';
import { DatabaseConditionLeftComponent } from './database-condition-left';

interface DatabaseConditionProps {
  label: string;
  name: string;
}

export function DatabaseCondition({ label, name }: DatabaseConditionProps) {
  const { conditionList = [], logic } = useConditions(name);

  return (
    <Field label={label} isEmpty={conditionList.length === 0}>
      <ConditionContainer
        conditions={conditionList.map(condition => ({
          left: <DatabaseConditionLeftComponent value={condition.left} />,
          operator: (
            <DatabaseConditionOperatorComponent value={condition.operator} />
          ),
          right: (
            <DatabaseConditionRightComponent
              value={condition.right}
              operator={condition.operator}
            />
          ),
        }))}
        logic={logic}
      />
    </Field>
  );
}
