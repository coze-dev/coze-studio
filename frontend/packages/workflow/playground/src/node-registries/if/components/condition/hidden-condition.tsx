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
  type ConditionItem,
  type ConditionValue,
} from '@/form-extensions/setters/condition/multi-condition/types';
import { HiddenConditionItem } from '@/form-extensions/setters/condition/hidden-condition/condition-item';

interface ConditionProps {
  value: ConditionValue;
  onChange?: (v?: ConditionValue) => void;
}

export const HiddenCondition: FC<ConditionProps> = props => {
  const { value, onChange } = props;

  const handleConditionItemChange: (
    branchIndex: number,
    conditionItemIndex: number,
  ) => (data: ConditionItem) => void =
    (branchIndex, conditionItemIndex) => conditionItem => {
      const activeBranch = value?.[branchIndex];

      const newConditions = activeBranch?.condition?.conditions?.map(
        (item, subIndex) => {
          if (subIndex === conditionItemIndex) {
            return {
              ...conditionItem,
            };
          } else {
            return item;
          }
        },
      );

      onChange?.(
        value?.map((branch, index) => {
          if (index === branchIndex) {
            return {
              condition: {
                ...branch.condition,
                conditions: newConditions,
              },
            };
          } else {
            return branch;
          }
        }),
      );
    };

  return (
    <>
      {value?.map((branch, branchIndex) =>
        branch.condition.conditions.map((item, conditionItemIndex) => (
          <HiddenConditionItem
            data={item}
            onDataChange={handleConditionItemChange(
              branchIndex,
              conditionItemIndex,
            )}
          />
        )),
      )}
    </>
  );
};
