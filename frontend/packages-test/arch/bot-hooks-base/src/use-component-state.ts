import { useState } from 'react';

import { type Obj } from '@coze-arch/bot-typings/common';

export interface ComponentStateUpdateFunc<State extends Obj> {
  (freshState: State, replace: true): void;
  (freshState: Partial<State>): void;
}

/**
 * 对 state 一层封装，用途：
 * 1. 默认增量更新
 * 2. 支持重置
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
