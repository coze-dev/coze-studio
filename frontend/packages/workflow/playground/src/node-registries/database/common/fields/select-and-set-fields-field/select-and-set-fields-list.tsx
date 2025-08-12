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

import { type DatabaseSettingField } from '@coze-workflow/base';

import { FieldArrayList, useFieldArray } from '@/form';

import { SelectAndSetFieldsItem } from './select-and-set-fields-item';

export function SelectAndSetFieldsList() {
  const { value } = useFieldArray<DatabaseSettingField>();

  return (
    <FieldArrayList>
      {value?.map(({ fieldID }, index) => (
        <SelectAndSetFieldsItem key={fieldID} index={index} />
      ))}
    </FieldArrayList>
  );
}
