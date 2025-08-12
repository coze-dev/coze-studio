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

/* eslint-disable @typescript-eslint/no-magic-numbers -- no need to fix */
import { useCallback } from 'react';

import { StandardNodeType } from '@coze-workflow/base';
import { Toast } from '@coze-arch/coze-design';
import { WorkflowNodePanelService } from '@flowgram-adapter/free-layout-editor';
import {
  type FlowNodeEntity,
  FlowNodeTransformData,
} from '@flowgram-adapter/free-layout-editor';
import {
  type PositionSchema,
  usePlayground,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowNodeEntity,
  WorkflowSelectService,
  type WorkflowNodeMeta,
  getAntiOverlapPosition,
  WorkflowDocument,
  type WorkflowSubCanvas,
} from '@flowgram-adapter/free-layout-editor';
import { Rectangle, type IPoint } from '@flowgram-adapter/common';

import { WorkflowCustomDragService, WorkflowEditService } from '@/services';
import { PANEL_WIDTH } from '@/components/node-panel/constant';

import { ADD_NODE_BUTTON_ID } from '../constants';

// Get hook for panel position
const useGetPanelPosition = () => {
  const playground = usePlayground();
  return useCallback(
    (targetBoundingRect: DOMRect): PositionSchema =>
      playground.config.getPosFromMouseEvent({
        clientX:
          targetBoundingRect.left +
          (targetBoundingRect.width - PANEL_WIDTH) / 2,
        clientY: targetBoundingRect.top - 5,
      }),
    [playground],
  );
};

// Get Node Center
const getNodesCenter = (nodes: WorkflowNodeEntity[]): IPoint => {
  const allBounds = nodes.map(
    node => node.getData(FlowNodeTransformData).bounds,
  );
  const { center } = Rectangle.enlarge(allBounds);
  return center;
};

// Select the node and open the node panel
const useFocusNode = () => {
  const editService = useService(WorkflowEditService);
  return useCallback(
    (node: WorkflowNodeEntity) => {
      editService.focusNode(node);
    },
    [editService],
  );
};

// Hook to handle child canvas nodes
const useAddSubCanvasNode = () => {
  const workflowDocument = useService(WorkflowDocument);
  const dragService = useService(WorkflowCustomDragService);
  const nodePanelService = useService<WorkflowNodePanelService>(
    WorkflowNodePanelService,
  );
  const getPanelPosition = useGetPanelPosition();
  const focusNode = useFocusNode();

  return useCallback(
    async (
      targetBoundingRect: DOMRect,
      containerNode: WorkflowNodeEntity,
    ): Promise<void> => {
      const panelPosition = getPanelPosition(targetBoundingRect);

      await nodePanelService.call({
        panelPosition,
        containerNode,
        panelProps: {
          enableDrag: true,
          enableModalMultiAdd: true,
          fromAddNodeBtn: true,
          anchorElement: `#${ADD_NODE_BUTTON_ID}`,
        },
        canAddNode: (params: { nodeType: string }) => {
          const canDropMessage = dragService.canDropToNode({
            dragNodeType: params.nodeType as StandardNodeType,
            dropNode: containerNode,
          });
          if (!canDropMessage.allowDrop) {
            Toast.warning({
              content: canDropMessage.message,
            });
          }
          return canDropMessage.allowDrop;
        },
        customPosition: ({ nodeType }) => {
          const childrenLength = containerNode.collapsedChildren.length;
          const containerCenter = getNodesCenter(
            containerNode.collapsedChildren,
          );
          const register = workflowDocument.getNodeRegister(nodeType);
          const size = register?.meta?.size;
          const centerPosition = {
            x: containerCenter.x,
            y: size ? containerCenter.y - size.height / 2 : containerCenter.y,
          };
          const adjustedPosition = dragService.adjustSubNodePosition(
            nodeType,
            containerNode,
            centerPosition,
          );
          const offsetPosition = {
            x: adjustedPosition.x + childrenLength * 30,
            y: adjustedPosition.y + childrenLength * 30,
          };
          return offsetPosition;
        },
        afterAddNode: focusNode as (node?: FlowNodeEntity) => void,
        enableMultiAdd: true,
      });
    },
    [
      dragService,
      focusNode,
      getPanelPosition,
      nodePanelService,
      workflowDocument,
    ],
  );
};

// Handling hooks for normal nodes
const useAddNormalNode = () => {
  const workflowDocument = useService(WorkflowDocument);
  const nodePanelService = useService<WorkflowNodePanelService>(
    WorkflowNodePanelService,
  );
  const playground = usePlayground();
  const getPanelPosition = useGetPanelPosition();
  const focusNode = useFocusNode();

  return useCallback(
    async (targetBoundingRect: DOMRect): Promise<void> => {
      const panelPosition = getPanelPosition(targetBoundingRect);
      await nodePanelService.call({
        panelPosition,
        panelProps: {
          enableDrag: true,
          enableModalMultiAdd: true,
          fromAddNodeBtn: true,
          anchorElement: `#${ADD_NODE_BUTTON_ID}`,
        },
        customPosition: ({ selectPosition }) => {
          const nodeWidth = 360;
          const nodePanelOffset = 450 / playground.config.zoom;
          const customPositionX =
            panelPosition.x + nodeWidth / 2 + nodePanelOffset;
          const customNodePosition = getAntiOverlapPosition(workflowDocument, {
            x: customPositionX,
            y: selectPosition.y,
          });
          return {
            x: customNodePosition.x,
            y: customNodePosition.y,
          };
        },
        enableSelectPosition: true,
        enableMultiAdd: true,
        afterAddNode: focusNode as (node?: FlowNodeEntity) => void,
      });
    },
    [
      getPanelPosition,
      nodePanelService,
      playground.config.zoom,
      workflowDocument,
      focusNode,
    ],
  );
};

const getNodeLinage = (node: WorkflowNodeEntity): WorkflowNodeEntity[] => {
  const linage: WorkflowNodeEntity[] = [node];
  let currentNode = node;
  while (currentNode.parent) {
    linage.unshift(currentNode.parent);
    currentNode = currentNode.parent;
  }
  return linage;
};

// Get container node
const getContainerNode = (selectService: WorkflowSelectService) => {
  const selectedNode = selectService.activatedNode;
  if (!selectedNode) {
    return;
  }
  if (selectedNode.getNodeMeta<WorkflowNodeMeta>().isContainer) {
    return selectedNode;
  }
  const selectedNodeType = selectedNode.flowNodeType;
  if (
    [StandardNodeType.Loop, StandardNodeType.Batch].includes(
      selectedNodeType as StandardNodeType,
    )
  ) {
    const nodeMeta: WorkflowNodeMeta = selectedNode.getNodeMeta();
    const subCanvas = nodeMeta.subCanvas?.(selectedNode);
    if (!subCanvas) {
      return;
    }
    return subCanvas.canvasNode;
  }
  const linage = getNodeLinage(selectedNode);
  const linageSubCanvas: WorkflowSubCanvas | undefined = linage
    .map(node => {
      const nodeMeta = node.getNodeMeta<WorkflowNodeMeta>();
      const subCanvas = nodeMeta.subCanvas?.(node);
      return subCanvas;
    })
    .filter(Boolean)
    .find(subCanvas => subCanvas?.isCanvas);
  // Existing in the parent is considered to be in the child canvas
  if (!linageSubCanvas) {
    return;
  }
  return linageSubCanvas.canvasNode;
};

export const useAddNode = () => {
  const selectService = useService(WorkflowSelectService);
  const addSubCanvasNode = useAddSubCanvasNode();
  const addNormalNode = useAddNormalNode();

  const addNode = useCallback(
    async (targetBoundingRect: DOMRect): Promise<void> => {
      const containerNode = getContainerNode(selectService);

      if (containerNode) {
        await addSubCanvasNode(targetBoundingRect, containerNode);
      } else {
        await addNormalNode(targetBoundingRect);
      }
    },
    [selectService, addSubCanvasNode, addNormalNode],
  );

  return addNode;
};
