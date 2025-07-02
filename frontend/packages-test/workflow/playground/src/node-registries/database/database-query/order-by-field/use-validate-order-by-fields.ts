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
