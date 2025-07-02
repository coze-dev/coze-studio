import { inject, injectable } from 'inversify';
import { DisposableCollection, addEventListener } from '@flowgram-adapter/common';

import {
  type ShortcutsContribution,
  type ShortcutsRegistry,
} from '../shortcut/shortcuts-service';
import { type LifecycleContribution } from '../common';
import { type CommandContribution, type CommandRegistry } from '../command';
import { NavigationService } from './navigation-service';

@injectable()
class NavigationContribution
  implements LifecycleContribution, CommandContribution, ShortcutsContribution
{
  @inject(NavigationService)
  protected readonly navigationService: NavigationService;

  private readonly _toDispose = new DisposableCollection();

  onLayoutInit() {
    // this.registerMouseNavigationListener();
  }

  onStart() {
    this.navigationService.init();
  }

  onDispose(): void {
    this.navigationService.dispose();
    this._toDispose.dispose();
  }

  registerCommands(registry: CommandRegistry) {
    registry.registerCommand(
      {
        id: 'navigation.forward',
        label: 'Forward',
      },
      {
        execute: () => {
          this.navigationService.forward();
        },
        isEnabled: () => this.navigationService.canGoForward(),
      },
    );
    registry.registerCommand(
      {
        id: 'navigation.back',
        label: 'Backward',
      },
      {
        execute: () => {
          this.navigationService.back();
        },
        isEnabled: () => this.navigationService.canGoBack(),
      },
    );
  }

  registerShortcuts(registry: ShortcutsRegistry) {
    registry.registerHandlers(
      {
        keybinding: 'control shift -',
        commandId: 'navigation.forward',
        preventDefault: true,
      },
      {
        keybinding: 'control -',
        commandId: 'navigation.back',
        preventDefault: true,
      },
    );
  }

  registerMouseNavigationListener() {
    this._toDispose.push(
      addEventListener(document.body, 'mousedown', (e: MouseEvent) => {
        switch (e.button) {
          case 3:
            this.navigationService.back();
            break;
          case 4:
            this.navigationService.forward();
            break;
          default:
            break;
        }
      }),
    );
  }
}

export { NavigationContribution };
