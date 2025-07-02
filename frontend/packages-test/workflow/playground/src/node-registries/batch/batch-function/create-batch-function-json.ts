import type {
  WorkflowNodeEntity,
  WorkflowSubCanvas,
} from '@flowgram-adapter/free-layout-editor';
import {
  FlowNodeBaseType,
  FlowNodeTransformData,
} from '@flowgram-adapter/free-layout-editor';
import { FlowRendererKey } from '@flowgram-adapter/free-layout-editor';
import {
  type IPoint,
  type PaddingSchema,
  type PositionSchema,
} from '@flowgram-adapter/common';
import type { WorkflowNodeJSON } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { BatchFunctionSize } from '../constants';
import { getBatchID } from './relation';

export const createBatchFunctionJSON = (
  id: string,
  position: IPoint,
): WorkflowNodeJSON => ({
  id,
  type: FlowNodeBaseType.SUB_CANVAS,
  data: {},
  meta: {
    isContainer: true,
    position,
    nodeDTOType: FlowNodeBaseType.SUB_CANVAS,
    useDynamicPort: true,
    renderKey: FlowRendererKey.SUB_CANVAS,
    size: {
      width: BatchFunctionSize.width,
      height: BatchFunctionSize.height,
    },
    defaultPorts: [
      { type: 'input', portID: 'batch-function-input', disabled: true },
      { type: 'input', portID: 'batch-function-inline-input' },
      { type: 'output', portID: 'batch-function-inline-output' },
    ],
    padding: (transform: FlowNodeTransformData): PaddingSchema => ({
      top: 100,
      bottom: 60,
      left: 100,
      right: 100,
    }),
    selectable(node: WorkflowNodeEntity, mousePos?: PositionSchema): boolean {
      if (!mousePos) {
        return true;
      }
      const transform = node.getData<FlowNodeTransformData>(
        FlowNodeTransformData,
      );
      // 鼠标开始时所在位置不包括当前节点时才可选中
      return !transform.bounds.contains(mousePos.x, mousePos.y);
    },
    renderSubCanvas: () => ({
      title: I18n.t('workflow_batch_canvas_title'),
      tooltip: I18n.t('workflow_batch_canvas_tooltips'),
      style: {
        minWidth: BatchFunctionSize.width,
        minHeight: BatchFunctionSize.height,
      },
      renderPorts: [
        {
          id: 'batch-function-input',
          type: 'input',
          style: {
            position: 'absolute',
            left: '50%',
            top: '0',
          },
        },
        {
          id: 'batch-function-inline-input',
          type: 'input',
          style: {
            position: 'absolute',
            right: '0',
            top: '50%',
            transform: 'translateY(20px)',
          },
        },
        {
          id: 'batch-function-inline-output',
          type: 'output',
          style: {
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translateY(20px)',
          },
        },
      ],
    }),
    subCanvas: (node: WorkflowNodeEntity): WorkflowSubCanvas | undefined => {
      const canvasNode = node;
      const parentNodeID = getBatchID(canvasNode.id);
      const parentNode = node.document.getNode(parentNodeID);
      if (!parentNode) {
        return undefined;
      }
      const subCanvas: WorkflowSubCanvas = {
        isCanvas: true,
        parentNode,
        canvasNode,
      };
      return subCanvas;
    },
  },
});
