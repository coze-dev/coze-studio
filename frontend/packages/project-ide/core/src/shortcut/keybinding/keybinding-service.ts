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
