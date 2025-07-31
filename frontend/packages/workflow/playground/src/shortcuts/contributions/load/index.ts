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
  EntityManager,
  WorkflowDocument,
} from '@flowgram-adapter/free-layout-editor';
import type {
  WorkflowShortcutsContribution,
  WorkflowShortcutsRegistry,
} from '@coze-workflow/render';
import { Toast } from '@coze-arch/coze-design';

import { WorkflowGlobalStateEntity } from '@/typing';
import { type WorkflowExportData } from '@/shortcuts/type';
import { WORKFLOW_EXPORT_TYPE } from '@/shortcuts/constant';
import { WorkflowOperationService, WorkflowSaveService } from '@/services';

import { WorkflowPasteShortcutsContribution } from '../paste';
import { safeFn } from '../../utils';

/**
 * Load file shortcut
 */
@injectable()
export class WorkflowLoadShortcutsContribution
  implements WorkflowShortcutsContribution
{
  public static readonly type = 'LOAD';

  @inject(WorkflowPasteShortcutsContribution)
  private pasteShortcuts: WorkflowPasteShortcutsContribution;
  @inject(WorkflowDocument)
  private document: WorkflowDocument;
  @inject(WorkflowGlobalStateEntity)
  private globalState: WorkflowGlobalStateEntity;
  @inject(WorkflowSaveService)
  private saveService: WorkflowSaveService;
  @inject(WorkflowOperationService) operationService: WorkflowOperationService;
  @inject(EntityManager) private entityManager: EntityManager;
  /** Registration shortcut */
  public registerShortcuts(registry: WorkflowShortcutsRegistry): void {
    registry.addHandlers({
      commandId: WorkflowLoadShortcutsContribution.type,
      shortcuts: ['meta shift l', 'ctrl shift l'],
      isEnabled: () => !this.globalState.readonly,
      execute: safeFn(this.handle.bind(this)),
    });
  }
  /** process */
  private async handle(): Promise<void> {
    const data = await this.load();
    if (!data) {
      return;
    }
    if (data.json.nodes.length > 200) {
      // Large workflow, page refresh
      await this.refresh(data);
    } else {
      // Small workflow, re-rendering
      await this.rerender(data);
    }
  }
  /** refresh */
  private async refresh(data: WorkflowExportData): Promise<void> {
    await this.operationService.save(
      data.json,
      this.saveService.ignoreStatusTransfer,
    );
    await this.globalState.reload();
    window.location.reload();
  }
  /** re-render */
  private async rerender(data: WorkflowExportData): Promise<void> {
    this.document.clear();
    this.entityManager.changeEntityLocked = true;
    this.pasteShortcuts.render({
      json: data.json,
      source: data.source,
    });
    this.entityManager.changeEntityLocked = false;
    await this.saveService.fitView();
    this.saveService.save();
  }
  /** load */
  private load(): Promise<WorkflowExportData | undefined> {
    return new Promise((resolve, reject) => {
      const handleError = (error: Error) => {
        console.error(error);
        Toast.error(`Load failed: ${error.message}`);
        resolve(undefined);
      };

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json,.flow';

      fileInput.addEventListener('change', event => {
        const file = (event.target as HTMLInputElement).files?.[0];

        if (!file) {
          resolve(undefined);
          return;
        }

        const reader = new FileReader();
        reader.onload = e => {
          try {
            const content: WorkflowExportData = JSON.parse(
              e.target?.result as string,
            );
            if (!this.validate(content)) {
              handleError(new Error('Invalid file'));
              return;
            }
            resolve(content);
          } catch (error) {
            handleError(error as Error);
          }
        };
        reader.onerror = () => handleError(new Error('Read file failed'));
        reader.readAsText(file);
      });

      fileInput.click();
    });
  }
  /** validation data */
  private validate(data: WorkflowExportData): boolean {
    if (data.type !== WORKFLOW_EXPORT_TYPE) {
      return false;
    }
    return true;
  }
}
