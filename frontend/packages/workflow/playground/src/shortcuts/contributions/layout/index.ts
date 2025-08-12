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
import {
  FreeOperationType,
  HistoryService,
} from '@flowgram-adapter/free-layout-editor';
import { AutoLayoutService } from '@flowgram-adapter/free-layout-editor';
import {
  type PositionSchema,
  TransformData,
} from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import type {
  WorkflowShortcutsContribution,
  WorkflowShortcutsRegistry,
} from '@coze-workflow/render';

import { WorkflowGlobalStateEntity } from '@/typing';

import { safeFn } from '../../utils';
import { getFollowNode } from './get-follow-node';

/**
 * Auto layout shortcuts
 */
@injectable()
export class WorkflowLayoutShortcutsContribution
  implements WorkflowShortcutsContribution
{
  public static readonly type = 'LAYOUT';

  @inject(WorkflowDocument) private document: WorkflowDocument;
  @inject(WorkflowGlobalStateEntity)
  private globalState: WorkflowGlobalStateEntity;
  @inject(AutoLayoutService) private autoLayoutService: AutoLayoutService;
  @inject(HistoryService) private historyService: HistoryService;
  /** Registration shortcut */
  public registerShortcuts(registry: WorkflowShortcutsRegistry): void {
    registry.addHandlers({
      commandId: WorkflowLayoutShortcutsContribution.type,
      shortcuts: ['alt shift f'],
      isEnabled: () => !this.globalState.readonly,
      execute: safeFn(this.handle.bind(this)),
    });
  }
  private async handle(): Promise<void> {
    await this.autoLayout();
  }
  public async autoLayout(): Promise<void> {
    const nodes = this.document.getAllNodes();
    const startPositions = nodes.map(this.getNodePosition);
    await this.autoLayoutService.layout({
      getFollowNode,
    });
    const endPositions = nodes.map(this.getNodePosition);
    this.updateHistory({
      nodes,
      startPositions,
      endPositions,
    });
  }
  private getNodePosition(node: WorkflowNodeEntity): PositionSchema {
    const transform = node.getData(TransformData);
    return {
      x: transform.position.x,
      y: transform.position.y,
    };
  }
  private updateHistory(params: {
    nodes: WorkflowNodeEntity[];
    startPositions: PositionSchema[];
    endPositions: PositionSchema[];
  }): void {
    const { nodes, startPositions: oldValue, endPositions: value } = params;
    const ids = nodes.map(node => node.id);
    this.historyService.pushOperation(
      {
        type: FreeOperationType.dragNodes,
        value: {
          ids,
          value,
          oldValue,
        },
      },
      {
        noApply: true,
      },
    );
  }
}
