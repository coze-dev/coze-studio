import {
  type WorkflowNodeEntity,
  type WorkflowJSON,
  type WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';

import { type Rect } from '../types';

/**
 * 生成子流程节点选项
 */
export interface GenerateSubWorkflowNodeOptions {
  name: string;
  workflowId: string;
  desc: string;
  spaceId: string;
}

/**
 * 封装生成服务
 */
export interface EncapsulateGenerateService {
  /**
   * 生成流程
   * @param nodes
   * @returns
   */
  generateWorkflowJSON: (
    nodes: WorkflowNodeEntity[],
    options?: {
      startEndRects?: {
        start: Rect;
        end: Rect;
      };
    },
  ) => Promise<WorkflowJSON>;
  /**
   * 生成子流程节点
   * @param options
   * @returns
   */
  generateSubWorkflowNode: (
    options: GenerateSubWorkflowNodeOptions,
  ) => Partial<WorkflowNodeJSON>;
}

export const EncapsulateGenerateService = Symbol('EncapsulateGenerateService');
