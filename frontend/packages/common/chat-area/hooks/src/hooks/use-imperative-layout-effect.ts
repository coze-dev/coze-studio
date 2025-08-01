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

import { useState, useRef, useLayoutEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- x
type Destructor = (() => void) | void;
type Fn<ARGS extends unknown[]> = (...args: ARGS) => Destructor;

export const useImperativeLayoutEffect = <Params extends unknown[]>(
  effect: Fn<Params>,
) => {
  const [effectValue, setEffectValue] = useState(0);
  const paramRef = useRef<Params>();
  const effectRef = useRef<Fn<Params>>(() => undefined);
  effectRef.current = effect;
  useLayoutEffect(() => {
    if (!effectValue) {
      return;
    }
    // After one run, it must not be undefined.
    return paramRef.current && effectRef.current(...paramRef.current);
  }, [effectValue]);

  return (...args: Params) => {
    paramRef.current = args;
    setEffectValue(pre => pre + 1);
  };
};
