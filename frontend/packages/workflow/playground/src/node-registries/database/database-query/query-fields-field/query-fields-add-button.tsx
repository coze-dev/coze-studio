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

import { nanoid } from 'nanoid';
import { cloneDeep, set } from 'lodash-es';
import {
  type ViewVariableMeta,
  type ViewVariableType,
} from '@coze-workflow/base';

import { SelectFieldsButton } from '@/node-registries/database/common/components';
import { useCurrentDatabaseQuery } from '@/hooks';
import { useFieldArray, useForm } from '@/form';

import { type QueryFieldSchema } from './types';

interface QueryFieldsAddButtonProps {
  afterAppend?: () => void;
}

export function QueryFieldsAddButton({
  afterAppend,
}: QueryFieldsAddButtonProps) {
  const { value, append, readonly } = useFieldArray<QueryFieldSchema>();
  const selectedFieldIDs = value?.map(({ fieldID }) => fieldID);
  const form = useForm();

  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const outputs = form.getValueIn<ViewVariableMeta[]>('outputs');

  return (
    <SelectFieldsButton
      onSelect={id => {
        append({ fieldID: id, isDistinct: false });
        const field = currentDatabase?.fields?.find(item => item.id === id);
        const outputListField = cloneDeep(outputs)?.find(
          item => item.name === 'outputList',
        ) as ViewVariableMeta;
        const rowNumField = outputs?.find(item => item.name === 'rowNum');
        const curIdField = outputListField?.children?.find(
          item => item.name === field?.name,
        );
        if (!curIdField) {
          if (!Array.isArray(outputListField?.children)) {
            set(outputListField, 'children', []);
          }
          outputListField?.children?.push({
            key: nanoid(),
            name: field?.name ?? '',
            type: field?.type as ViewVariableType,
          });
          form.setValueIn('outputs', [outputListField, rowNumField]);
        }
        afterAppend?.();
      }}
      selectedFieldIDs={selectedFieldIDs}
      fields={currentDatabase?.fields}
      filterSystemFields={false}
      readonly={readonly}
    />
  );
}
