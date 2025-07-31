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

import {
  inject,
  injectable,
  multiInject,
  optional,
  postConstruct,
} from 'inversify';
import { CommandRegistry } from '@flowgram-adapter/free-layout-editor';

interface ShorcutsHandler {
  commandId: string;
  shortcuts: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isEnabled?: (...args: any[]) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (...args: any[]) => void;
}

export const WorkflowShortcutsContribution = Symbol(
  'WorkflowShortcutsContribution',
);

export interface WorkflowShortcutsContribution {
  registerShortcuts: (registry: WorkflowShortcutsRegistry) => void;
}

@injectable()
export class WorkflowShortcutsRegistry {
  @multiInject(WorkflowShortcutsContribution)
  @optional()
  protected contribs: WorkflowShortcutsContribution[];
  @inject(CommandRegistry) protected commandRegistry: CommandRegistry;
  readonly shortcutsHandlers: ShorcutsHandler[] = [];
  addHandlers(...handlers: ShorcutsHandler[]): void {
    // Registration command
    handlers.forEach(handler => {
      this.commandRegistry.registerCommand(
        { id: handler.commandId },
        { execute: handler.execute, isEnabled: handler.isEnabled },
      );
    });
    this.shortcutsHandlers.push(...handlers);
  }
  addHandlersIfNotFound(...handlers: ShorcutsHandler[]): void {
    handlers.forEach(handler => {
      if (!this.has(handler.commandId)) {
        this.addHandlers(handler);
      }
    });
  }
  has(commandId: string): boolean {
    return this.shortcutsHandlers.some(
      handler => handler.commandId === commandId,
    );
  }
  @postConstruct()
  protected init(): void {
    this.contribs?.forEach(contrib => contrib.registerShortcuts(this));
  }
}
