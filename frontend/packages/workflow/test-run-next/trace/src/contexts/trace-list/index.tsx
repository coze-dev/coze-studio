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

import { createContext, useMemo, useContext } from 'react';

import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { type Span } from '@coze-arch/bot-api/workflow_api';

export interface TraceListState {
  spaceId: string;
  workflowId: string;
  isInOp?: boolean;
  /** When opening it for the first time, you need to request the list first, and then select the first item. */
  ready: boolean;
  /** Currently selected span */
  span: Span | null;
}

export interface TraceListAction {
  /** update status */
  patch: (next: Partial<TraceListState>) => void;
}

const createTraceListStore = (
  params: Pick<TraceListState, 'spaceId' | 'workflowId' | 'isInOp'>,
) =>
  createWithEqualityFn<TraceListState & TraceListAction>(
    set => ({
      ...params,
      ready: false,
      span: null,
      patch: next => set(() => next),
    }),
    shallow,
  );

type TraceListStore = ReturnType<typeof createTraceListStore>;

export const TraceListContext = createContext<TraceListStore>(
  {} as unknown as TraceListStore,
);

export const TraceListProvider: React.FC<
  React.PropsWithChildren<
    Pick<TraceListState, 'spaceId' | 'workflowId' | 'isInOp'>
  >
> = ({ spaceId, workflowId, isInOp, children }) => {
  const store = useMemo(
    () => createTraceListStore({ spaceId, workflowId, isInOp }),
    [spaceId, workflowId, isInOp],
  );

  return (
    <TraceListContext.Provider value={store}>
      {children}
    </TraceListContext.Provider>
  );
};

export const useTraceListStore = <T,>(
  selector: (s: TraceListState & TraceListAction) => T,
) => {
  const store = useContext(TraceListContext);

  return store(selector);
};
