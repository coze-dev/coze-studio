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

import React from 'react';

import {
  inject,
  injectable,
  multiInject,
  optional,
  postConstruct,
} from 'inversify';
import { logger } from '@flowgram-adapter/common';

import { type LifecycleContribution } from '../common';
import { type CommandHandler, CommandRegistry } from '../command';
import { domEditable } from './utils';
import { Shortcuts } from './shortcuts';
import { type Keybinding, KeybindingRegistry } from './keybinding';

export interface ShortcutsHandler
  extends Partial<Pick<CommandHandler, 'execute' | 'isEnabled'>> {
  /**
   * Register shortcut IDs
   */
  commandId: string;
  /**
   * Register shortcut label
   */
  commandLabel?: string;
  /**
   * execution context
   */
  when?: string;
  /**
   * The shortcuts involved
   */
  keybinding: string[] | string;
  /**
   * Whether to block the browser's default behavior
   */
  preventDefault?: boolean;
  /**
   * Shortcut source
   */
  source?: string;
}

export const ShortcutsContribution = Symbol('ShortcutsContribution');

export interface ShortcutsContribution {
  registerShortcuts: (registry: ShortcutsRegistry) => void;
}

export interface ShortcutsRegistry {
  /**
   * Add shortcutHandlers
   */
  registerHandlers: (...handlers: ShortcutsHandler[]) => void;
}

@injectable()
export class ShortcutsService
  implements ShortcutsRegistry, LifecycleContribution
{
  @inject(KeybindingRegistry) protected keybindingRegistry: KeybindingRegistry;

  @inject(CommandRegistry) protected commandRegistry: CommandRegistry;

  @multiInject(ShortcutsContribution)
  @optional()
  protected readonly contributions: ShortcutsContribution[] = [];

  readonly shortcutsHandlerMap: Map<string, ShortcutsHandler> = new Map();

  private _enable = true;

  get enable() {
    return this._enable;
  }

  set enable(isEnabled: boolean) {
    this._enable = isEnabled;
  }

  get shortcutsHandlers(): ShortcutsHandler[] {
    return Array.from(this.shortcutsHandlerMap.values());
  }

  @postConstruct()
  protected init() {
    for (const contrib of this.contributions) {
      contrib.registerShortcuts(this);
    }
  }

  /**
   * IDE initialization phase registration listener
   */
  onInit(): void {
    document.addEventListener('keydown', this.listener);
  }

  /**
   * IDE destruction phase to remove listeners
   */
  onDispose(): void {
    document.removeEventListener('keydown', this.listener);
  }

  private generateShortcutId(shortcut: ShortcutsHandler): string {
    return [shortcut.commandId, shortcut.source, shortcut.when]
      .filter(Boolean)
      .join();
  }

  private listener = (ev: KeyboardEvent) => {
    if (!this._enable) {
      return;
    }
    const keybindings = this.keybindingRegistry.getMatchKeybinding(ev);
    logger.log('ShortcutsRegistry - listener', ev, keybindings);
    keybindings.forEach(keybinding => {
      /**
       * Defined global shortcuts do not take effect on input components to avoid conflicts
       */
      if (domEditable(ev.target as HTMLElement) && !keybinding.when) {
        return;
      } else {
        this.executeKeybinding(keybinding, ev);
      }
    });
  };

  registerHandlers(...handlers: ShortcutsHandler[]): void {
    // Registration handler
    handlers.forEach(handler => {
      const keybindings = Array.isArray(handler.keybinding)
        ? handler.keybinding
        : [handler.keybinding];

      const shortcutId = this.generateShortcutId(handler);

      if (!this.shortcutsHandlerMap.has(shortcutId)) {
        this.shortcutsHandlerMap.set(shortcutId, {
          ...handler,
          keybinding: [],
        });
      }

      const shortcut: ShortcutsHandler = this.shortcutsHandlerMap.get(
        shortcutId,
      ) as ShortcutsHandler;
      const originKeybindings = Array.isArray(shortcut.keybinding)
        ? shortcut.keybinding
        : [shortcut.keybinding];

      const unregisterKeybindings = keybindings.filter(
        k => !originKeybindings.includes(k),
      );

      unregisterKeybindings.forEach(k => {
        this.keybindingRegistry.registerKeybinding({
          keybinding: k,
          when: handler.when,
          command: handler.commandId,
          preventDefault: handler.preventDefault,
        });
      });

      shortcut.keybinding = [
        ...new Set([...unregisterKeybindings, ...originKeybindings]),
      ];

      if (handler.execute) {
        if (!this.commandRegistry.getCommand(handler.commandId)) {
          this.commandRegistry.registerCommand(
            {
              id: handler.commandId,
              label: handler.commandLabel,
            },
            handler as CommandHandler,
          );
        } else {
          this.commandRegistry.updateCommand(handler.commandId, {
            label: handler.commandLabel,
          });
        }
      }
    });
  }

  public getShortcutHandlerByCommandId(
    commandId: string,
  ): ShortcutsHandler | undefined {
    const shortcut = this.shortcutsHandlers.find(
      v => v.commandId === commandId,
    );

    return shortcut;
  }

  public getLabelWithShortcutUI(commandId: string): React.ReactNode {
    const command = this.commandRegistry.getCommand(commandId);

    const keybinding = this.getShortcutHandlerByCommandId(commandId);

    if (command && command.label) {
      const label = command.shortLabel || command.label;
      const shortcuts = this.getShortcutByCommandId(commandId);

      if (keybinding) {
        return <Shortcuts shortcuts={shortcuts} label={label} />;
      }
      return label;
    }

    return '';
  }

  public getLabelWithShortcutByCommandId(
    commandId: string,
    { useShortLabel }: { useShortLabel?: boolean } = {},
  ): string {
    const command = this.commandRegistry.getCommand(commandId);

    const handler = this.getShortcutHandlerByCommandId(commandId);

    if (command && command.label) {
      const label = useShortLabel
        ? command.shortLabel || command.label
        : command.label;

      if (handler) {
        const shortcuts = this.getShortcutByCommandId(commandId);

        return `${label}(${shortcuts.map(s => s.join('')).join('/')})`;
      }
      return label;
    }

    return '';
  }

  public getShortcutByCommandId(commandId: string): string[][] {
    const shortcut = this.getShortcutHandlerByCommandId(commandId);

    if (!shortcut) {
      return [];
    }

    const keybindings = Array.isArray(shortcut.keybinding)
      ? shortcut.keybinding
      : [shortcut.keybinding];
    return keybindings.map(k => this.getKeyDisplayLabel(k));
  }

  public getKeyDisplayLabel(keybinding: string): string[] {
    return this.keybindingRegistry.getKeybindingLabel(keybinding);
  }

  /**
   * Get ShortcutsHandler from source
   */
  public getShortcutsBySource(source: string): ShortcutsHandler[] {
    return this.shortcutsHandlers.filter(v => v.source === source);
  }

  /**
   * Get keybinding based on keyboard events
   */
  public getKeybindingMatchKeyEvent(
    keybindings: Keybinding[],
    ev: KeyboardEvent,
  ): Keybinding[] {
    return keybindings.filter(k =>
      this.keybindingRegistry.checkKeybindingMatchKeyEvent(ev, k),
    );
  }

  /**
   * Execute keybinding
   */
  public executeKeybinding(keybinding: Keybinding, ev: KeyboardEvent) {
    this.commandRegistry.executeCommand(keybinding.command, keybinding.args);
    if (keybinding.preventDefault) {
      ev.preventDefault();
    }
  }
}
