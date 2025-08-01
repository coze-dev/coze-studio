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

import { type DatabaseCondition } from '@coze-workflow/base';

import { useFieldArray, FieldArrayList } from '@/form';

import { ConditionItemField } from './condition-item-field';

interface ConditionListProps {
  min?: number;
}

export function ConditionList({ min }: ConditionListProps) {
  const { name, value, remove, readonly } = useFieldArray<DatabaseCondition>();

  return (
    <FieldArrayList>
      {value?.map((_, index) => (
        <ConditionItemField
          name={`${name}.[${index}]`}
          disableRemove={
            readonly || (min !== undefined ? value?.length <= min : false)
          }
          onClickRemove={() => {
            remove(index);
          }}
          hasFeedback={false}
        />
      ))}
    </FieldArrayList>
  );
}
