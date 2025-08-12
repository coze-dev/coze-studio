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
import { PlaygroundConfigEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowNodeEntity,
  WorkflowSelectService,
} from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowShortcutsContribution,
  type WorkflowShortcutsRegistry,
} from '@coze-workflow/render';

import { EncapsulateService } from '../encapsulate';
import { EncapsulateCommands } from './types';
import { EncapsulateRenderService } from './encapsulate-render-service';

/**
 * Package shortcut
 */
@injectable()
export class EncapsulateShortcutsContribution
  implements WorkflowShortcutsContribution
{
  @inject(PlaygroundConfigEntity)
  private playgroundConfigEntity: PlaygroundConfigEntity;

  @inject(EncapsulateService)
  private encapsulateService: EncapsulateService;

  @inject(EncapsulateRenderService)
  private encapsulateRenderService: EncapsulateRenderService;

  @inject(WorkflowSelectService)
  private workflowSelectService: WorkflowSelectService;

  registerShortcuts(registry: WorkflowShortcutsRegistry): void {
    registry.addHandlers(
      /**
       * package
       */
      {
        commandId: EncapsulateCommands.ENCAPSULATE,
        shortcuts: ['meta g', 'ctrl g'],

        isEnabled: () => !this.playgroundConfigEntity.readonly,

        execute: async () => {
          if (!this.encapsulateService.canEncapsulate()) {
            return;
          }

          const res = await this.encapsulateService.validate();

          if (res.hasError()) {
            this.encapsulateRenderService.showTooltip();
            return;
          }

          this.encapsulateRenderService.setLoading(true);
          try {
            await this.encapsulateService.encapsulate();
            this.encapsulateRenderService.closeModal();
          } catch (e) {
            console.error(e);
          }
          this.encapsulateRenderService.setLoading(false);
        },
      },
      /**
       * unblock
       */
      {
        commandId: EncapsulateCommands.DECAPSULATE,
        shortcuts: ['meta shift g', 'ctrl shift g'],
        isEnabled: () => !this.playgroundConfigEntity.readonly,
        execute: () => {
          const { selectedNodes } = this.workflowSelectService;
          if (selectedNodes.length !== 1) {
            return;
          }

          const node = selectedNodes[0] as WorkflowNodeEntity;
          if (!this.encapsulateService.canDecapsulate(node)) {
            return;
          }
          this.encapsulateService.decapsulate(node);
        },
      },
    );
  }
}
