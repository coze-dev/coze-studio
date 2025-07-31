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

import { useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- .
type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

// https://github.com/Volune/use-event-callback/blob/master/src/index.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- .
export const useEventCallback = <A extends any[], R>(
  fn: Fn<A, R>,
): Fn<A, R> => {
  const ref = useRef(fn);
  ref.current = fn;
  const exposedRef = useRef((...args: A) => ref.current(...args));
  return exposedRef.current;
};
