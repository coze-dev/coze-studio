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

import { ContextMatcher, type LifecycleContribution } from '../../common';
import { Keybinding } from './keybinding';

export const KeybindingContribution = Symbol('KeybindingContribution');

@injectable()
export class KeybindingRegistry implements LifecycleContribution {
  public readonly keybindings: Keybinding[] = [];

  @inject(ContextMatcher) contextMatcher: ContextMatcher;

  onInit() {}

  public registerKeybinding(keybinding: Keybinding): void {
    this.keybindings.push(keybinding);
  }

  public getMatchKeybinding(keyEvent: KeyboardEvent): Keybinding[] {
    return this.keybindings.filter(
      keybinding =>
        this.checkKeybindingMatchKeyEvent(keyEvent, keybinding) &&
        this.checkKeybindingMatchContext(keybinding),
    );
  }

  public checkKeybindingMatchKeyEvent(
    keyEvent: KeyboardEvent,
    keybinding: Keybinding,
  ): boolean {
    return Keybinding.isKeyEventMatch(keyEvent, keybinding.keybinding);
  }

  public checkKeybindingMatchContext(keybinding: Keybinding): boolean {
    return !keybinding.when || this.contextMatcher.match(keybinding.when);
  }

  public getKeybindingLabel(keybinding: string): string[] {
    return Keybinding.getKeybindingLabel(keybinding);
  }
}
