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

import { useState, useMemo } from 'react';

type State = any;

export interface ReturnValue<T = State> {
  state: T;
  toggle: (value?: T) => void;
}

function useToggle<T = boolean>(): ReturnValue<T>;

function useToggle<T = State>(defaultValue: T): ReturnValue<T>;

function useToggle<T = State, U = State>(
  defaultValue: T,
  reverseValue: U,
): ReturnValue<T | U>;

function useToggle<D extends State = State, R extends State = State>(
  defaultValue: D = false as D,
  reverseValue?: R,
) {
  const [state, setState] = useState<D | R>(defaultValue);

  const actions = useMemo(() => {
    const reverseValueOrigin = (
      reverseValue === undefined ? !defaultValue : reverseValue
    ) as D | R;

    const toggle = (value?: D | R) => {
      if (value !== undefined) {
        setState(value);
        return;
      }
      setState(s => (s === defaultValue ? reverseValueOrigin : defaultValue));
    };
    return {
      toggle,
    };
  }, [defaultValue, reverseValue]);

  return {
    state,
    ...actions,
  };
}

export default useToggle;
