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

import { type Obj } from '@coze-arch/bot-typings/common';

export interface ComponentStateUpdateFunc<State extends Obj> {
  (freshState: State, replace: true): void;
  (freshState: Partial<State>): void;
}

/**
 * One-layer encapsulation of state, use:
 * 1. Default incremental update
 * 2. Support reset
 *
 * @example
 * const { state, resetState, setState } = useComponentState({ a: 1, b: 2 });
 * console.log(state);  // { a: 1, b: 2 }
 * setState({ b: 3 });  // { a: 1, b: 3 }
 *
 * setState({ a: 2 }, true);  // { a: 2 }
 *
 * resetState();  // { a: 1, b: 2 }
 *
 * @author lengfangbing
 * @docs by zhanghaochen
 */
export function useComponentState<State extends Obj>(initState: State) {
  const [state, customSetState] = useState(initState);

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

  return {
    state,
    resetState,
    setState: setState as ComponentStateUpdateFunc<State>,
  };
}
