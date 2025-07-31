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
   * Update the status of the node being added, clickOutside will not close the node panel at this time
   * @param isAdding
   * @returns
   */
  onAddingNode?: (isAdding: boolean) => void;
}

const NodePanelContext = createContext<NodePanelContextType>({});

export const NodePanelContextProvider = NodePanelContext.Provider;

export const useNodePanelContext = () => useContext(NodePanelContext);
