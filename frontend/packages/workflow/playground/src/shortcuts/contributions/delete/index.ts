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
  WorkflowCommands,
  WorkflowDocument,
  WorkflowLineEntity,
  WorkflowNodeEntity,
  type WorkflowNodeMeta,
  WorkflowSelectService,
} from '@flowgram-adapter/free-layout-editor';
import type {
  WorkflowShortcutsContribution,
  WorkflowShortcutsRegistry,
} from '@coze-workflow/render';

import { WorkflowGlobalStateEntity } from '@/typing';

import { safeFn } from '../../utils';
import { isValid } from './is-valid';

/**
 * 删除快捷键
 */
@injectable()
export class WorkflowDeleteShortcutsContribution
  implements WorkflowShortcutsContribution
{
  @inject(WorkflowDocument) private document: WorkflowDocument;
  @inject(WorkflowSelectService) private selection: WorkflowSelectService;
  @inject(WorkflowGlobalStateEntity)
  private globalState: WorkflowGlobalStateEntity;
  /** 注册快捷键 */
  public registerShortcuts(registry: WorkflowShortcutsRegistry): void {
    registry.addHandlers({
      commandId: WorkflowCommands.DELETE_NODES,
      shortcuts: ['backspace', 'delete'],
      isEnabled: () => !this.globalState.readonly,
      execute: safeFn(this.handle.bind(this)),
    });
  }
  private handle(): void {
    if (!isValid(this.selectedNodes)) {
      return;
    }
    // 删除选中实体
    this.selection.selection.forEach(entity => {
      if (entity instanceof WorkflowNodeEntity) {
        this.removeNode(entity);
      } else if (entity instanceof WorkflowLineEntity) {
        this.removeLine(entity);
      } else {
        entity.dispose();
      }
    });
    // 过滤掉已删除的实体
    this.selection.selection = this.selection.selection.filter(
      s => !s.disposed,
    );
  }
  /** 获取选中的节点 */
  private get selectedNodes(): WorkflowNodeEntity[] {
    return this.selection.selection.filter(
      n => n instanceof WorkflowNodeEntity,
    ) as WorkflowNodeEntity[];
  }
  /** 删除节点 */
  private removeNode(node: WorkflowNodeEntity): void {
    if (!this.document.canRemove(node)) {
      return;
    }
    const nodeMeta = node.getNodeMeta<WorkflowNodeMeta>();
    const subCanvas = nodeMeta.subCanvas?.(node);
    if (subCanvas?.isCanvas) {
      subCanvas.parentNode.dispose();
      return;
    }
    node.dispose();
  }
  /** 删除连线 */
  private removeLine(line: WorkflowLineEntity): void {
    if (!this.document.linesManager.canRemove(line)) {
      return;
    }
    line.dispose();
  }
}
