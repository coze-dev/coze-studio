import { useCallback, useState, type MouseEvent } from 'react';

import { NodeIntoContainerService } from '@flowgram-adapter/free-layout-editor';
import { useEntityFromContext, useService } from '@flowgram-adapter/free-layout-editor';
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
