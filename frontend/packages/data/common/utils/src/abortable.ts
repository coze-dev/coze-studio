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

import { useRef, useEffect } from 'react';

export function useUnmountSignal() {
  const controllerRef = useRef<AbortController | null>(null);

  if (controllerRef.current === null) {
    controllerRef.current = new AbortController();
  }

  useEffect(
    () => () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    },
    [],
  );

  return controllerRef.current.signal;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- must be any
export function abortable<T extends (...args: any[]) => any | Promise<any>>(
  func: T,
  abortSignal: AbortSignal,
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args) => {
    try {
      if (abortSignal.aborted) {
        throw new Error('Function aborted');
      }

      const result = func(...args);

      if (result instanceof Promise) {
        return await Promise.race([
          result,
          new Promise((_, reject) => {
            abortSignal.addEventListener(
              'abort',
              () => reject(new Error('Function aborted')),
              { once: true },
            );
          }),
        ]);
      }

      return result;
    } catch (e) {
      console.log(e);
    }
  };
}
