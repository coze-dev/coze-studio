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

import { useCurrentDatabaseField } from '@/node-registries/database/common/hooks';
import { DataTypeTag } from '@/node-registries/common/components';
import { Label, withField, useField } from '@/form';

import { type OrderByFieldSchema } from './types';
import { AceOrDescField } from './ace-or-desc-field';

export const OrderByItemField = withField(() => {
  const { name, value } = useField<OrderByFieldSchema>();
  const databaseField = useCurrentDatabaseField(value?.fieldID);

  return (
    <>
      <Label
        className="w-[138px]"
        extra={<DataTypeTag type={databaseField?.type}></DataTypeTag>}
      >
        <span className="w-[90px] truncate">{databaseField?.name}</span>
      </Label>
      <AceOrDescField name={`${name}.isAsc`} type={databaseField?.type} />
    </>
  );
});
