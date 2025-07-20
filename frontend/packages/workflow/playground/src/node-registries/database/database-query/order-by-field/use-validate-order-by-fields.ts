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
 
import { useEffect } from 'react';

import { useFieldArray } from '@/form';

import { useQueryFieldIDs } from './use-query-field-ids';
import { type OrderByFieldSchema } from './types';

// 监听查询字段 当查询字段发生变化时 检查排序字段是否存在于查询字段中 不存在则移除
export const useValidateOrderFields = () => {
  const { value, onChange } = useFieldArray<OrderByFieldSchema>();
  const queryFieldIDs = useQueryFieldIDs();
  useEffect(() => {
    const fieldSchemaFiltered = value?.filter(({ fieldID }) =>
      queryFieldIDs.includes(fieldID),
    );
    onChange(fieldSchemaFiltered || []);
  }, [queryFieldIDs?.join(',')]);
};
