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

import { useCurrentDatabaseQuery } from '@/hooks';
import { useFieldArray } from '@/form';

import { SelectFieldsButton } from '../../components';

export function SelectAndSetFieldsAddButton({
  afterAppend,
}: {
  afterAppend?: () => void;
}) {
  const { value, append, readonly } = useFieldArray<DatabaseSettingField>();
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const selectedFieldIDs = value?.map(({ fieldID }) => fieldID);

  return (
    <SelectFieldsButton
      readonly={readonly}
      selectedFieldIDs={selectedFieldIDs}
      onSelect={id => {
        append({ fieldID: id });
        afterAppend?.();
      }}
      fields={currentDatabase?.fields?.filter(
        ({ isSystemField }) => !isSystemField,
      )}
    />
  );
}
