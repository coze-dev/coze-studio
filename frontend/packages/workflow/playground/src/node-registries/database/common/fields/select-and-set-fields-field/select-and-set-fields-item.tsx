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

import { ValueExpressionInputField } from '@/node-registries/common/fields';
import { DataTypeTag } from '@/node-registries/common/components';
import { useCurrentDatabaseQuery } from '@/hooks';
import { FieldArrayItem, useFieldArray } from '@/form';

import { useSelectAndSetFieldsContext } from './select-and-set-fields-context';

export function SelectAndSetFieldsItem({ index }: { index: number }) {
  const { name, value, remove, readonly } =
    useFieldArray<DatabaseSettingField>();
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const { shouldDisableRemove } = useSelectAndSetFieldsContext();

  const fieldSchema = value?.[index];
  const field = currentDatabase?.fields?.find(
    ({ id }) => id === fieldSchema?.fieldID,
  );

  return (
    <FieldArrayItem
      onRemove={() => remove(index)}
      disableRemove={readonly || shouldDisableRemove?.(field)}
    >
      <ValueExpressionInputField
        label={field?.name}
        required={field?.required}
        tooltip={field?.description}
        labelExtra={field?.type && <DataTypeTag type={field.type} />}
        name={`${name}.${index}.fieldValue`}
        inputType={field?.type}
      />
    </FieldArrayItem>
  );
}
