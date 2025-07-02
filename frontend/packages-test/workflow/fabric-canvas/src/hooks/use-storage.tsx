import { useState } from 'react';

import { useMemoizedFn, useUpdateEffect } from 'ahooks';

export interface Options<T> {
  defaultValue?: T | (() => T);
}

const storage: Record<string, unknown> = {};

/**
 * 持久化保存到内存
 */
export function useStorageState<T>(key: string, options: Options<T> = {}) {
  function getStoredValue() {
    const raw = storage?.[key] ?? options?.defaultValue;
    return raw as T;
  }

  const [state, setState] = useState<T>(getStoredValue);

  useUpdateEffect(() => {
    setState(getStoredValue());
  }, [key]);

  const updateState = (value: T) => {
    setState(value);
    storage[key] = value;
  };

  return [state, useMemoizedFn(updateState)] as const;
}
