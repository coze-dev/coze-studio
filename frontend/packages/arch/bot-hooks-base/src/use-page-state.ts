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

import { useEffect, useRef, useState } from 'react';

export interface PageStateUpdateFunc<State extends object = object> {
  (freshState: State, replace: true): void;
  (freshState: Partial<State>): void;
}

/**
 * A layer of encapsulation of state, including updating state and resetting state
 *
 * @deprecated Please use the useComponentStates of bot-hooks
 */
export function usePageState<State extends object = object>(
  initState: State,
  autoResetWhenDestroy = false,
) {
  const [state, customSetState] = useState(initState);
  const destroyRef = useRef(false);

  function setState(freshState: State, replace: true): void;
  function setState(freshState: Partial<State>): void;
  function setState(freshState: Partial<State> | State, replace?: true) {
    if (replace) {
      customSetState(freshState as State);
    }
    customSetState(prev => ({ ...prev, ...freshState }));
  }

  const resetState = () => {
    customSetState(initState);
  };

  useEffect(() => {
    destroyRef.current = autoResetWhenDestroy;
  }, [autoResetWhenDestroy]);

  useEffect(
    () => () => {
      // Automatic reset status
      if (destroyRef.current) {
        resetState();
      }
    },
    [],
  );

  return {
    state,
    resetState,
    setState: setState as PageStateUpdateFunc<State>,
  };
}
