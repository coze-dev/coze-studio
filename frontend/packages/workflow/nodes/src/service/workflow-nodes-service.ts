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

import { customAlphabet } from 'nanoid';
import { inject, injectable } from 'inversify';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { EntityManager } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { Emitter } from '@flowgram-adapter/common';

import { type FormNodeMeta } from '../typings';
import { DEFAULT_NODE_META_PATH } from '../constants';

@injectable()
export class WorkflowNodesService {
  protected onNodesTitleChangeEmitter = new Emitter<void>();
  @inject(EntityManager) protected readonly entityManager: EntityManager;
  private nanoid = customAlphabet('1234567890', 5);
  /**
   * Node header change
   */
  readonly onNodesTitleChange = this.onNodesTitleChangeEmitter.event;

  /**
   * Node header update
   * @param node
   */
  getNodeTitle(node: WorkflowNodeEntity): string {
    const formData = node.getData<FlowNodeFormData>(FlowNodeFormData);
    const nodeMeta = formData.formModel.getFormItemValueByPath<FormNodeMeta>(
      DEFAULT_NODE_META_PATH,
    );

    return nodeMeta?.title || '';
  }

  /**
   * Get all nodes
   */
  getAllNodes(ignoreNode?: WorkflowNodeEntity): WorkflowNodeEntity[] {
    return this.entityManager
      .getEntities<WorkflowNodeEntity>(WorkflowNodeEntity)
      .filter(n => n.id !== 'root' && n !== ignoreNode);
  }
  /**
   * Get the titles of all nodes
   */
  getAllTitles(ignoreNode?: WorkflowNodeEntity): string[] {
    return this.getAllNodes(ignoreNode).map(node => this.getNodeTitle(node));
  }
  /**
   * Get start node
   */
  getStartNode(): WorkflowNodeEntity {
    return this.entityManager
      .getEntities<WorkflowNodeEntity>(WorkflowNodeEntity)
      .find(node => node.isStart) as WorkflowNodeEntity;
  }
  /**
   * Trigger node header update event
   */
  fireNodesTitleChange(): void {
    this.onNodesTitleChangeEmitter.fire();
  }

  /**
   * Create non-duplicate titles
   *
   * abc_1 -> abc_2
   */

  createUniqTitle(
    titlePrefix: string,
    ignoreNode?: WorkflowNodeEntity | undefined,
    ignoreTitles?: string[],
  ): string {
    const allTitles = this.getAllTitles(ignoreNode);
    if (ignoreTitles) {
      allTitles.push(...ignoreTitles);
    }

    const allTitlesSet = new Set(allTitles);

    let startIndex = 0;
    let newTitle = `${titlePrefix}`;

    const matched = titlePrefix.match(/_([0-9]+)$/);
    if (matched) {
      startIndex = Number(matched[1]);
      titlePrefix = titlePrefix.slice(0, matched.index);
    }

    while (allTitlesSet.has(newTitle)) {
      startIndex += 1;
      newTitle = `${titlePrefix}_${startIndex}`;
    }
    return newTitle;
  }

  /** Create a unique ID */
  createUniqID() {
    let id: string;
    do {
      // To prevent the id from starting with 0, the backend will be converted to int64, resulting in 0 loss, so some IDs cannot match
      id = `1${this.nanoid()}`;
    } while (this.entityManager.getEntityById(id));
    return id;
  }
}
