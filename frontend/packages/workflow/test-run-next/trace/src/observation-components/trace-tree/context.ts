import { createContext, useContext } from 'react';

import { type TreeNodeInfo } from '../common/tree/typing';

interface TraceTreeContext {
  treeMap: Record<string, TreeNodeInfo>;
  onCollapse: (id: string, collapsed: boolean) => void;
}

export const traceTreeContext = createContext<TraceTreeContext>({
  treeMap: {},
  onCollapse: (id, collapsed) => '',
});

export const useTraceTree = () => useContext(traceTreeContext);
