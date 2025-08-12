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
import { Layer, SelectionService } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowCommands,
  WorkflowDocument,
  WorkflowHoverService,
  WorkflowLineEntity,
  WorkflowLinesManager,
  WorkflowNodeEntity,
  type WorkflowNodeMeta,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowShortcutsRegistry } from '../workflow-shorcuts-contribution';
import { isShortcutsMatch } from '../utils/shortcuts-utils';

@injectable()
export class ShortcutsLayer extends Layer<object> {
  static type = 'ShortcutsLayer';
  @inject(WorkflowShortcutsRegistry) shortcuts: WorkflowShortcutsRegistry;
  @inject(SelectionService) selection: SelectionService;
  @inject(WorkflowHoverService) hoverService: WorkflowHoverService;
  @inject(WorkflowDocument) document: WorkflowDocument;
  @inject(WorkflowLinesManager) linesManager: WorkflowLinesManager;
  onReady(): void {
    this.shortcuts.addHandlersIfNotFound(
      /**
       * delete
       */
      {
        commandId: WorkflowCommands.DELETE_NODES,
        shortcuts: ['backspace', 'delete'],
        isEnabled: () =>
          this.selection.selection.length > 0 &&
          !this.config.disabled &&
          !this.config.readonly,
        execute: () => {
          this.selection.selection.forEach(entity => {
            if (entity instanceof WorkflowNodeEntity) {
              if (!this.document.canRemove(entity)) {
                return;
              }
              const nodeMeta = entity.getNodeMeta<WorkflowNodeMeta>();
              const subCanvas = nodeMeta.subCanvas?.(entity);
              if (subCanvas?.isCanvas) {
                subCanvas.parentNode.dispose();
                return;
              }
            } else if (
              entity instanceof WorkflowLineEntity &&
              !this.linesManager.canRemove(entity)
            ) {
              return;
            }
            entity.dispose();
          });
          this.selection.selection = this.selection.selection.filter(
            s => !s.disposed,
          );
        },
      },
      /**
       * enlarge
       */
      {
        commandId: WorkflowCommands.ZOOM_IN,
        shortcuts: ['meta =', 'ctrl ='],
        execute: () => {
          this.config.zoomin();
        },
      },
      /**
       * zoom out
       */
      {
        commandId: WorkflowCommands.ZOOM_OUT,
        shortcuts: ['meta -', 'ctrl -'],
        execute: () => {
          this.config.zoomout();
        },
      },
    );
    this.toDispose.pushAll([
      // Monitor canvas mouse movement events
      this.listenPlaygroundEvent('keydown', (e: KeyboardEvent) => {
        if (!this.isFocused || e.target !== this.playgroundNode) {
          return;
        }
        this.shortcuts.shortcutsHandlers.some(shortcutsHandler => {
          if (
            isShortcutsMatch(e, shortcutsHandler.shortcuts) &&
            (!shortcutsHandler.isEnabled || shortcutsHandler.isEnabled(e))
          ) {
            shortcutsHandler.execute(e);
            e.preventDefault();
            return true;
          }
        });
      }),
    ]);
  }
}
