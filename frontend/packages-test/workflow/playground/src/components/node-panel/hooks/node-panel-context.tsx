import { useContext, createContext, type MouseEvent } from 'react';

import { type NodePanelSearchType } from '@coze-arch/bot-api/workflow_api';

import { type UnionNodeTemplate } from '@/typing';
interface NodePanelContextType {
  onSelect?: (props: {
    event: MouseEvent<HTMLElement>;
    nodeTemplate: UnionNodeTemplate;
  }) => void;
  enableDrag?: boolean;
  keyword?: string;
  getScrollContainer?: () => HTMLDivElement | undefined;
  onLoadMore?: (id?: NodePanelSearchType, cursor?: string) => Promise<void>;
  /**
   * 更新正在添加节点的状态，此时 clickOutside 不会关闭节点面板
   * @param isAdding
   * @returns
   */
  onAddingNode?: (isAdding: boolean) => void;
}

const NodePanelContext = createContext<NodePanelContextType>({});

export const NodePanelContextProvider = NodePanelContext.Provider;

export const useNodePanelContext = () => useContext(NodePanelContext);
