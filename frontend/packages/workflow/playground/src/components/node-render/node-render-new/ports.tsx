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

import React, { useCallback } from 'react';

import { WorkflowNodePanelService } from '@flowgram-adapter/free-layout-editor';
import {
  FlowNodeBaseType,
  type FlowNodeEntity,
  FlowNodeTransformData,
} from '@flowgram-adapter/free-layout-editor';
import {
  useNodeRender,
  type WorkflowPortEntity,
  useService,
  usePlayground,
  WorkflowDocument,
  getAntiOverlapPosition,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowPortRender } from '@coze-workflow/render';
import { type StandardNodeType } from '@coze-workflow/base';
import { Toast } from '@coze-arch/coze-design';

import { WorkflowCustomDragService, WorkflowEditService } from '@/services';

const useClickPort = () => {
  const document = useService(WorkflowDocument);
  const nodePanelService = useService(WorkflowNodePanelService);
  const dragService = useService(WorkflowCustomDragService);
  const editService = useService(WorkflowEditService);
  const playground = usePlayground();

  const getContainer = (fromNode: WorkflowNodeEntity) => {
    const fromContainer = fromNode?.parent;
    if (fromNode?.flowNodeType === FlowNodeBaseType.SUB_CANVAS) {
      // Subcanvas internal input wiring
      return fromNode;
    }
    if (fromContainer?.flowNodeType === FlowNodeBaseType.ROOT) {
      return;
    }
    return fromContainer;
  };

  const clickPort = useCallback(
    async (event: React.MouseEvent, port: WorkflowPortEntity) => {
      if (playground.config.readonly) {
        return;
      }
      const sourceNode = port.node;
      const containerNode = getContainer(sourceNode);
      const panelPosition = playground.config.getPosFromMouseEvent(event);
      const node = await (nodePanelService as WorkflowNodePanelService).call({
        panelPosition,
        enableBuildLine: true,
        fromPort: port,
        panelProps: {
          enableScrollClose: true,
        },
        canAddNode: ({ nodeType }) => {
          const canDropMessage = dragService.canDropToNode({
            dragNodeType: nodeType as StandardNodeType,
            dropNode: containerNode,
          });
          if (!canDropMessage.allowDrop) {
            Toast.warning({
              content: canDropMessage.message,
            });
          }
          return canDropMessage.allowDrop;
        },
        customPosition({ nodeType }) {
          const sourceRect = sourceNode.getData(FlowNodeTransformData).bounds;
          const offsetPosition = {
            x: sourceRect.right + 300,
            y: sourceRect.y,
          };
          const adjustedPosition = dragService.adjustSubNodePosition(
            nodeType,
            containerNode,
            offsetPosition,
          );
          const antiOverlapPosition = getAntiOverlapPosition(
            document,
            adjustedPosition,
            containerNode,
          );
          return antiOverlapPosition;
        },
      });
      editService.focusNode(node as FlowNodeEntity);
      return node;
    },
    [document, dragService, editService, nodePanelService, playground],
  );

  return clickPort;
};

export function Ports() {
  const { ports } = useNodeRender();
  const clickPort = useClickPort();
  return (
    <>
      {ports.map(port => (
        <WorkflowPortRender key={port.id} entity={port} onClick={clickPort} />
      ))}
    </>
  );
}
