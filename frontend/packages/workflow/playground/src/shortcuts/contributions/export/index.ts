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
import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import type {
  WorkflowShortcutsContribution,
  WorkflowShortcutsRegistry,
} from '@coze-workflow/render';

import { WorkflowGlobalStateEntity } from '@/typing';
import { type WorkflowExportData } from '@/shortcuts/type';
import { WORKFLOW_EXPORT_TYPE } from '@/shortcuts/constant';

import { WorkflowCopyShortcutsContribution } from '../copy';
import { safeFn } from '../../utils';

/**
 * Export shortcut
 */
@injectable()
export class WorkflowExportShortcutsContribution
  implements WorkflowShortcutsContribution
{
  public static readonly type = 'EXPORT';

  @inject(WorkflowDocument)
  private document: WorkflowDocument;
  @inject(WorkflowGlobalStateEntity)
  private globalState: WorkflowGlobalStateEntity;
  @inject(WorkflowCopyShortcutsContribution)
  private copyShortcuts: WorkflowCopyShortcutsContribution;
  /** Registration shortcut */
  public registerShortcuts(registry: WorkflowShortcutsRegistry): void {
    registry.addHandlers({
      commandId: WorkflowExportShortcutsContribution.type,
      shortcuts: ['meta shift s', 'ctrl shift s'],
      execute: safeFn(this.handle.bind(this)),
    });
  }
  private async handle(): Promise<void> {
    const data = await this.toJSON();
    this.download({ data, filename: this.filename });
  }
  private async toJSON(): Promise<WorkflowExportData> {
    const source = this.copyShortcuts.toSource();
    const json = await this.copyShortcuts.toJSON(this.validNodes);
    const data: WorkflowExportData = {
      type: WORKFLOW_EXPORT_TYPE,
      source,
      json,
    };
    return data;
  }
  private get validNodes(): WorkflowNodeEntity[] {
    return this.document.root.blocks.filter(
      b => b.flowNodeType !== FlowNodeBaseType.SUB_CANVAS,
    );
  }
  private get filename(): string {
    return `coze-workflow-${this.globalState.workflowId}.flow`;
  }
  private download(params: {
    data: WorkflowExportData;
    filename: string;
  }): void {
    const { data, filename } = params;
    // Create Blob Object
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
