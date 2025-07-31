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

import { useState } from 'react';

import { useMemoizedFn, useUpdateEffect } from 'ahooks';

export interface Options<T> {
  defaultValue?: T | (() => T);
}

const storage: Record<string, unknown> = {};

/**
 * Persistent save to memory
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
