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

import { inject, injectable } from 'inversify';
import { WorkflowNode } from '@coze-workflow/base';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

import { getSubCanvasParent, isSubCanvasNode } from '../utils/subcanvas';
@injectable()
export class EncapsulateBaseValidator {
  @inject(WorkflowDocument)
  protected workflowDocument: WorkflowDocument;

  protected getLineName(from: string, to: string) {
    return `${this.getNodeNameById(from)} -> ${this.getNodeNameById(to)}`;
  }

  protected getLineSource(from: string, to: string) {
    return `${from}_${to}`;
  }

  protected getNodeName(node: WorkflowNodeEntity) {
    if (!node) {
      return;
    }

    if (isSubCanvasNode(node)) {
      return this.getSubCanvasName(node);
    }
    const workflowNode = new WorkflowNode(node);
    return workflowNode.title || this.defaultNodeName(node.id);
  }

  protected getSubCanvasName(node: WorkflowNodeEntity) {
    const nodeMeta = node.getNodeMeta();
    const { title = '' } = nodeMeta?.renderSubCanvas?.() ?? {};
    return title || this.defaultNodeName(node.id);
  }

  protected getSubCanvasIcon(node: WorkflowNodeEntity) {
    const parent = getSubCanvasParent(node);
    return this.getNodeIcon(parent);
  }

  protected getNodeIcon(node: WorkflowNodeEntity) {
    if (!node) {
      return;
    }

    if (isSubCanvasNode(node)) {
      return this.getSubCanvasIcon(node);
    }
    const workflowNode = new WorkflowNode(node);
    return workflowNode.icon;
  }

  protected getNodeNameById(id: string) {
    const node = this.workflowDocument.getNode(id);

    if (!node) {
      return this.defaultNodeName(id);
    }

    return this.getNodeName(node);
  }

  protected defaultNodeName(id: string) {
    return `Node${id}`;
  }
}
