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
