// workflow store，目前保存 flow 的 nodes 和 edges 数据

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import {
  type WorkflowEdgeJSON,
  type WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';

interface WorkflowStoreState {
  /** 节点数据 */
  nodes: WorkflowNodeJSON[];

  /** 边数据 */
  edges: WorkflowEdgeJSON[];

  /** 是否在创建 workflow */
  isCreatingWorkflow: boolean;
}

interface WorkflowStoreAction {
  setNodes: (value: WorkflowNodeJSON[]) => void;
  setEdges: (value: WorkflowEdgeJSON[]) => void;
  setIsCreatingWorkflow: (value: boolean) => void;
}

const initialStore: WorkflowStoreState = {
  nodes: [],
  edges: [],
  isCreatingWorkflow: false,
};

export const useWorkflowStore = create<
  WorkflowStoreState & WorkflowStoreAction
>()(
  devtools(set => ({
    ...initialStore,
    setNodes: nodes => set({ nodes: nodes ?? [] }),
    setEdges: edges => set({ edges: edges ?? [] }),
    setIsCreatingWorkflow: value => set({ isCreatingWorkflow: value }),
  })),
);
