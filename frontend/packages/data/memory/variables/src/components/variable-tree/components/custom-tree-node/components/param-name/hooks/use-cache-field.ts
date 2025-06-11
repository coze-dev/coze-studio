import { useEffect, useRef } from 'react';

import { useFormApi } from '@coze/coze-design';

import { type Variable } from '@/store';

export const useCacheField = (data: Variable) => {
  const formApi = useFormApi();

  const lastValidValueRef = useRef(data.name);

  useEffect(() => {
    const currentValue = formApi.getValue(`${data.variableId}.name`);
    if (currentValue) {
      lastValidValueRef.current = currentValue;
    } else if (lastValidValueRef.current) {
      formApi.setValue(`${data.variableId}.name`, lastValidValueRef.current);
    }
  }, [data.variableId]);
};
