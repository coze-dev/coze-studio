import { createContext, useMemo, useContext } from 'react';

import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { type Span } from '@coze-arch/bot-api/workflow_api';

export interface TraceListState {
  spaceId: string;
  workflowId: string;
  isInOp?: boolean;
  /** 初次打开时需要先请求列表，然后选中第一项 */
  ready: boolean;
  /** 当前选中的 span */
  span: Span | null;
}

export interface TraceListAction {
  /** 更新状态 */
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
