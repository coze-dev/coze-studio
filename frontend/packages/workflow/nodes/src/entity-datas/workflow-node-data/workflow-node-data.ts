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

/**
 * What is this module for?
 * In the node model of workflow, the default storage for data is only the form, that is, formMeta. This part of the data actually represents the data submitted to the backend for workflow execution
 * However, in the actual business scenario, we need not only the data submitted to the back-end for operation, but also some data that needs to be consumed in the front-end business scenario, but not used by the back-end. For example:
 *  1. spaceId and release status of the api node
 *  2. SpaceId and publication status of the child process node
 * So this module adds a NodeData entity to manage some data on each node for consumption and use by the business layer
 */
import { EntityData } from '@flowgram-adapter/free-layout-editor';

import { type EditAbleNodeData, type NodeData } from './types';

export class WorkflowNodeData extends EntityData {
  private nodeData;

  private hasSetNodeData = false;

  init() {
    this.hasSetNodeData = false;
    this.nodeData = undefined;
  }

  getDefaultData() {
    return undefined;
  }

  /**
   *
   * @param data
   * Set up data other than form on the node
   * Generics must pass in the node type StandardNodeType
   */
  setNodeData<T extends keyof NodeData = never>(data: NodeData[T]) {
    if (this.hasSetNodeData) {
      // The settings will be repeated when undoing and redoing, there is no need to report an error.
      console.warn(`node ${this.entity.id} has already set WorkflowNodeData`);
      return;
    }

    this.nodeData = { ...data };
    this.hasSetNodeData = true;
  }

  /**
   *
   * @param data
   * Update data, put only non-readonly field updates
   * Generics must pass in the node type StandardNodeType
   */
  updateNodeData<T extends keyof NodeData = never>(
    data: Partial<EditAbleNodeData<T>>,
  ) {
    this.nodeData = { ...this.nodeData, ...data };
  }
  /**
   *
   * @returns
   * Get data other than form on the node
   */
  getNodeData<T extends keyof NodeData>(): NodeData[T] {
    return this.nodeData;
  }
}
