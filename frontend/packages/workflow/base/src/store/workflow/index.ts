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
