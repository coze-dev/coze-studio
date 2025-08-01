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

import { useCallback, useState, type MouseEvent } from 'react';

import { NodeIntoContainerService } from '@flowgram-adapter/free-layout-editor';
import {
  useEntityFromContext,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import {
  delay,
  WorkflowDragService,
  WorkflowSelectService,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

interface UseMoveOutProps {
  onHandle: () => void;
}

export const useMoveOut = ({ onHandle }: UseMoveOutProps) => {
  const node = useEntityFromContext<WorkflowNodeEntity>();
  const nodeIntoContainerService = useService<NodeIntoContainerService>(
    NodeIntoContainerService,
  );
  const selectService = useService<WorkflowSelectService>(
    WorkflowSelectService,
  );
  const dragService = useService<WorkflowDragService>(WorkflowDragService);

  const [canMoveOut, setCanMoveOut] = useState(
    nodeIntoContainerService.canMoveOutContainer(node),
  );

  const updateCanMoveOut = useCallback(() => {
    setCanMoveOut(nodeIntoContainerService.canMoveOutContainer(node));
  }, [node, nodeIntoContainerService]);

  const handleMoveOut = useCallback(
    async (e: MouseEvent) => {
      e.stopPropagation();
      const sourceContainer = node.parent;
      if (!sourceContainer) {
        return;
      }
      nodeIntoContainerService.moveOutContainer({ node });
      nodeIntoContainerService.removeNodeLines(node);
      await new Promise(resolve => requestAnimationFrame(resolve));
      await delay(20);
      updateCanMoveOut();
      selectService.clear();
      selectService.selectNode(node);
      dragService.startDragSelectedNodes(e);
      onHandle();
    },
    [
      dragService,
      node,
      nodeIntoContainerService,
      selectService,
      updateCanMoveOut,
      onHandle,
    ],
  );

  return {
    canMoveOut,
    handleMoveOut,
    updateCanMoveOut,
  };
};
