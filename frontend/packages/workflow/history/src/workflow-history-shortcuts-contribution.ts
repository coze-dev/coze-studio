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

/* eslint-disable @typescript-eslint/naming-convention */
import { inject, injectable } from 'inversify';
import { PlaygroundConfigEntity } from '@flowgram-adapter/free-layout-editor';
import { WorkflowCommands } from '@flowgram-adapter/free-layout-editor';
import { HistoryService } from '@flowgram-adapter/common';
import {
  type WorkflowShortcutsContribution,
  type WorkflowShortcutsRegistry,
} from '@coze-workflow/render';
import { reporter } from '@coze-workflow/base';

import { WorkflowHistoryConfig } from './workflow-history-config';

/**
 * History shortcut
 */
@injectable()
export class WorkflowHistoryShortcutsContribution
  implements WorkflowShortcutsContribution
{
  @inject(HistoryService)
  private _historyService: HistoryService;
  @inject(WorkflowHistoryConfig)
  private _config: WorkflowHistoryConfig;
  @inject(PlaygroundConfigEntity)
  private _playgroundConfig: PlaygroundConfigEntity;

  registerShortcuts(registry: WorkflowShortcutsRegistry): void {
    registry.addHandlers(
      /**
       * revoke
       */
      {
        commandId: WorkflowCommands.UNDO,
        shortcuts: ['meta z', 'ctrl z'],
        isEnabled: () => !this._playgroundConfig.readonly,
        execute: () => {
          if (this._config.disabled) {
            return;
          }
          this._historyService.undo();
          reporter.info({
            message: 'workflow_undo',
          });
        },
      },
      /**
       * redo
       */
      {
        commandId: WorkflowCommands.REDO,
        shortcuts: ['meta shift z', 'ctrl shift z'],
        isEnabled: () => !this._playgroundConfig.readonly,
        execute: () => {
          if (this._config.disabled) {
            return;
          }
          this._historyService.redo();
          reporter.info({
            message: 'workflow_redo',
          });
        },
      },
    );
  }
}
