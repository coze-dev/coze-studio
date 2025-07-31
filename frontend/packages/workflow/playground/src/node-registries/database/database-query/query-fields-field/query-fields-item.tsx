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

import { useNodeTestId } from '@coze-workflow/base';

import { useCurrentDatabaseField } from '@/node-registries/database/common/hooks';
import { DataTypeTag } from '@/node-registries/common/components';
import { FieldArrayItem, Label, useFieldArray } from '@/form';

import { type QueryFieldSchema } from './types';

interface QueryFieldsItemProps {
  index: number;
}

export function QueryFieldsItem({ index }: QueryFieldsItemProps) {
  const { name, value, remove, readonly } = useFieldArray<QueryFieldSchema>();
  const databaseField = useCurrentDatabaseField(value?.[index].fieldID);
  const { getNodeSetterId } = useNodeTestId();

  return (
    <FieldArrayItem
      disableRemove={readonly}
      onRemove={() => remove(index)}
      removeTestId={`${getNodeSetterId(name)}.remove`}
    >
      <Label
        className="w-[249px]"
        extra={<DataTypeTag type={databaseField?.type}></DataTypeTag>}
      >
        <span className="max-w-[200px] truncate">{databaseField?.name}</span>
      </Label>
    </FieldArrayItem>
  );
}
