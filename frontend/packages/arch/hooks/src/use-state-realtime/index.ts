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

import {
  useState,
  useRef,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from 'react';

const isFunction = (val: any): val is Function => typeof val === 'function';

// Get a new state value, compatible with passing values and functions
function getStateVal<T>(
  preState: T,
  initVal?: SetStateAction<T>,
): T | undefined {
  if (isFunction(initVal)) {
    return initVal(preState);
  }
  return initVal;
}

function useStateRealtime<T>(
  initialState: T | (() => T),
): [T, Dispatch<SetStateAction<T>>, () => T];
function useStateRealtime<T = undefined>(): [
  T | undefined,
  Dispatch<SetStateAction<T | undefined>>,
  () => T | undefined,
];
function useStateRealtime<T>(
  initVal?: T | (() => T),
): [
  T | undefined,
  Dispatch<SetStateAction<T | undefined>>,
  () => T | undefined,
] {
  const initState = getStateVal(undefined, initVal);
  const [val, setVal] = useState(initState);
  const valRef = useRef(initState);
  const setState = useCallback((newVal?: SetStateAction<T | undefined>) => {
    const newState = getStateVal(valRef.current, newVal);
    valRef.current = newState;
    setVal(newState);
  }, []);
  const getRealState = useCallback(() => valRef.current, []);
  return [val, setState, getRealState];
}

export default useStateRealtime;
