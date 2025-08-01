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

import { SelectFieldsButton } from '@/node-registries/database/common/components';
import { useFieldArray } from '@/form';

import { useQueryFields } from './use-query-fields';
import { type OrderByFieldSchema } from './types';
interface OrderByAddButtonProps {
  afterAppend?: () => void;
}

export function OrderByAddButton({ afterAppend }: OrderByAddButtonProps) {
  const queryFields = useQueryFields();
  const { value, append, readonly } = useFieldArray<OrderByFieldSchema>();
  const selectedFieldIDs = value?.map(({ fieldID }) => fieldID);

  return (
    <SelectFieldsButton
      onSelect={id => {
        append({ fieldID: id, isAsc: true });
        afterAppend?.();
      }}
      selectedFieldIDs={selectedFieldIDs}
      fields={queryFields}
      filterSystemFields={false}
      readonly={readonly}
      testName="order-fileds-add-button"
    />
  );
}
