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
  type CommandContribution,
  type CommandRegistry,
  type ShortcutsContribution,
  type StylingContribution,
  type Collector,
  type ColorTheme,
  type ShortcutsRegistry,
  CommandRegistryFactory,
  Command,
  NavigationService,
} from '@coze-project-ide/core';

import { WidgetOpenHandler } from '../widget/widget-open-handler';
import { type FlowDockPanel } from '../widget/dock-panel';
import { type CustomTitleType } from '../types';
import { ApplicationShell } from '../shell';
import { ViewService } from '../services/view-service';
import {
  BOTTOM_PANEL_ID,
  CUSTOM_TAB_BAR_CONTAINER,
  MAIN_PANEL_ID,
  TAB_BAR_ACTION_CONTAINER,
  TAB_BAR_SCROLL_CONTAINER,
  TAB_BAR_TOOLBAR,
  TAB_BAR_TOOLBAR_ITEM,
} from '../constants';
import { getPanelStyle } from './styles/panel-style';
import { getFlowMenuStyle } from './styles/menu-style';

@injectable()
export class ViewCommonContribution
  implements CommandContribution, StylingContribution, ShortcutsContribution
{
  @inject(ApplicationShell) protected readonly shell: ApplicationShell;

  @inject(ViewService) viewService: ViewService;

  @inject(NavigationService) navigationService: NavigationService;

  @inject(CommandRegistryFactory) commandFactory: () => CommandRegistry;

  get commandService(): CommandRegistry {
    return this.commandFactory();
  }

  @inject(WidgetOpenHandler) protected readonly openHandler: WidgetOpenHandler;

  registerStyle({ add }: Collector, { getColor }: ColorTheme): void {
    add(`
    ${getFlowMenuStyle(getColor)}
    .flow-hover {
      color: ${getColor('flowide.color.base.text.0')};
      background: ${getColor('flowide.color.base.bg.0')};

      border: 2px solid ${getColor('flowide.color.base.border')};
      border-radius: 6px;
      padding: 4px;
    }
    .flowide-container {
      height: 100%;
    }
    .flowide-container .debug-bar-widget-container {
      position: fixed;
      width: fit-content;
      height: fit-content;
    }
    .flowide-container .lm-Widget {
      width: 100%;
      height: 100%;
    }
    .flowide-container .flow-tab-icon-label {
      display: flex;
      align-items: center;
      width: 100%;
      overflow: hidden;
    }
    .flowide-container .flow-tab-icon-label .flow-TabBar-tabLabel-text {
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: keep-all;
      white-space: nowrap;
    }
    .flowide-container .lm-TabBar-tabCloseIcon:hover {
      cursor: pointer;
    }
    .flowide-container .lm-TabBar-content {
      width: fit-content;
      border: 0;
    }
    .flowide-container .lm-DockPanel-handle {
      background: ${getColor('flowide.color.base.border')};
    }
    .flowide-container .lm-TabBar {
      color: ${getColor('flowide.color.base.text.2')};
      background: ${getColor('flowide.color.base.fill.0')};
      display: flex;
      height: 24px;
    }
    .flowide-container .lm-TabBar-tab {
      background: transparent;
      border: 0;
      min-width: 125px;
      max-height: 24px;
      line-height: 24px;
    }
    .flowide-container .lm-TabBar-tab:hover {
      color: ${getColor('flowide.color.base.text.0')};
      background: ${getColor('flowide.color.base.fill.0')};
    }
    .flowide-container .lm-DockPanel-handle[data-orientation="vertical"] {
      min-height: 1px;
      z-index: 3;
    }
    .flowide-container .lm-DockPanel-handle[data-orientation="vertical"]:hover {
      background: ${getColor('flowide.color.base.primary.hover')};
      min-height: 4px;
    }
    .flowide-container .lm-DockPanel-handle[data-orientation="vertical"]:active {
      background: ${getColor('flowide.color.base.primary')};
      min-height: 4px;
    }

    .flowide-container .lm-DockPanel-handle[data-orientation="horizontal"] {
      min-width: 1px;
    }
    .flowide-container .lm-DockPanel-handle[data-orientation="horizontal"]:hover {
      background: ${getColor('flowide.color.base.primary.hover')};
      min-width: 4px;
    }
    .flowide-container .lm-DockPanel-handle[data-orientation="horizontal"]:active {
      background: ${getColor('flowide.color.base.primary')};
      min-width: 4px;
    }
    .flowide-container .lm-TabBar-tab.lm-mod-current {
      background: ${getColor('flowide.color.base.bg.0')};
      color: ${getColor('flowide.color.base.text.0')};
      transform: unset;
      position: relative;
    }
    .flowide-container #${MAIN_PANEL_ID} .lm-TabBar-tab.lm-mod-current::before {
      position: absolute;
      top: 0;
      left: 0;
      content: "";
      width: 100%;
      height: 2px;
      background: ${getColor('flowide.color.base.primary')};
    }
    .flowide-container #${BOTTOM_PANEL_ID} .lm-TabBar-tab.lm-mod-current::before {
      position: absolute;
      bottom: 0;
      left: 0;
      content: "";
      width: 100%;
      height: 2px;
      background: ${getColor('flowide.color.base.primary')};
    }
    .flowide-container .lm-TabBar-tabCloseIcon.saving:before {
      content: "\\f111";
    }
    .flowide-container .lm-TabBar-tabCloseIcon.saving:hover:before {
      content: "\\f00d";
    }
    .flowide-container .${CUSTOM_TAB_BAR_CONTAINER} {
      display: flex;
      width: 100%;
      height: 100%;
      justify-content: space-between;
    }
    .flowide-container .${TAB_BAR_SCROLL_CONTAINER} {
      flex-grow: 1;
      position: relative;
      overflow: hidden;
    }
    .flowide-container .${TAB_BAR_SCROLL_CONTAINER} .ide-ps__rail-x {
      z-index: 999999;
      user-select: none;
      pointer-events: none;
    }
    .flowide-container .${TAB_BAR_SCROLL_CONTAINER} .ide-ps__thumb-x {
      height: 2px;
    }
    .flowide-container .${TAB_BAR_ACTION_CONTAINER} {
      flex-shrink: 0;
      height: 100%;
    }
    .flowide-container .${TAB_BAR_ACTION_CONTAINER} .${TAB_BAR_TOOLBAR} {
      display: flex;
      height: 100%;
    }
    .flowide-container .${TAB_BAR_ACTION_CONTAINER} .${TAB_BAR_TOOLBAR_ITEM} {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 4px;
    }
      ${getPanelStyle(getColor)}
    }`);
  }

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(
      {
        id: Command.Default.VIEW_CLOSE_ALL_WIDGET,
        label: 'Close All Tab',
      },
      {
        execute: () => {
          const parentWidget = this.shell.currentWidget?.parent;
          const widgets = (parentWidget as FlowDockPanel).tabBars();

          let titles: CustomTitleType[] = [];
          for (const customTabBar of widgets) {
            titles = titles.concat(customTabBar.titles as CustomTitleType[]);
          }
          this.commandService.executeCommand(
            Command.Default.VIEW_SAVING_WIDGET_CLOSE_CONFIRM,
            titles,
          );
        },
      },
    );

    commands.registerCommand(
      {
        id: Command.Default.VIEW_CLOSE_CURRENT_WIDGET,
        label: 'Close Current Tab',
        shortLabel: 'Close',
      },
      {
        execute: widget => {
          const closeWidget = widget || this.shell.currentWidget;
          if (closeWidget) {
            this.commandService.executeCommand(
              Command.Default.VIEW_SAVING_WIDGET_CLOSE_CONFIRM,
              [closeWidget.title],
            );
          }
        },
      },
    );

    commands.registerCommand(
      {
        id: Command.Default.VIEW_REOPEN_LAST_WIDGET,
        label: 'Reopen Last Tab',
      },
      {
        execute: () => {
          const lastCloseUri = this.shell.closeWidgetUriStack.pop();
          if (lastCloseUri) {
            this.openHandler.open(lastCloseUri);
          }
        },
      },
    );

    commands.registerCommand(
      {
        id: Command.Default.VIEW_CLOSE_OTHER_WIDGET,
        label: 'Close Other Tab',
      },
      {
        execute: widget => {
          try {
            const currentWidget = widget || this.shell.currentWidget;
            const parentWidget = currentWidget?.parent;
            if (!parentWidget) {
              return;
            }
            const titles: CustomTitleType[] = [];
            const widgets = (parentWidget as FlowDockPanel).tabBars();

            for (const customTabBar of widgets) {
              [...customTabBar.titles].map(title => {
                if (title.owner !== currentWidget) {
                  titles.push(title as CustomTitleType);
                }
              });
            }
            this.commandService.executeCommand(
              Command.Default.VIEW_SAVING_WIDGET_CLOSE_CONFIRM,
              titles,
            );
          } catch (e) {
            console.error(e);
          }
        },
      },
    );

    commands.registerCommand(
      {
        id: Command.Default.VIEW_CLOSE_BOTTOM_PANEL,
        label: 'Close/Open Bottom Pannel',
      },
      {
        execute: () => {
          // Open the problem by default when there is no focus content
          if (!this.shell.bottomPanel?.currentTitle) {
            this.commandService.executeCommand(Command.Default.VIEW_PROBLEMS);
          }

          this.shell.bottomPanel.setHidden(!this.shell.bottomPanel.isHidden);
        },
      },
    );

    commands.registerCommand(
      {
        id: Command.Default.VIEW_OPEN_NEXT_TAB,
        label: 'Open Next Tab',
      },
      {
        execute: () => {
          this.viewService.openNextTab();
        },
      },
    );

    commands.registerCommand(
      {
        id: Command.Default.VIEW_OEPN_LAST_TAB,
        label: 'Open Last Tab',
      },
      {
        execute: () => {
          this.viewService.openLastTab();
        },
      },
    );

    commands.registerCommand(
      {
        id: Command.Default.VIEW_FULL_SCREEN,
        label: 'Full Screen',
      },
      {
        execute: this.shell.disableFullScreen
          ? () => null
          : () => {
              this.viewService.switchFullScreenMode();
            },
      },
    );
  }

  registerShortcuts(registry: ShortcutsRegistry): void {
    // Close all current tabs
    registry.registerHandlers({
      keybinding: 'alt shift w',
      commandId: Command.Default.VIEW_CLOSE_ALL_WIDGET,
    });

    // Open next tab
    registry.registerHandlers({
      keybinding: 'alt shift rightarrow',
      commandId: Command.Default.VIEW_OPEN_NEXT_TAB,
      preventDefault: true,
    });

    // Open previous tab
    registry.registerHandlers({
      keybinding: 'alt shift leftarrow',
      commandId: Command.Default.VIEW_OEPN_LAST_TAB,
      preventDefault: true,
    });

    // Close the current tab
    registry.registerHandlers({
      keybinding: 'alt w',
      commandId: Command.Default.VIEW_CLOSE_CURRENT_WIDGET,
    });

    // Open Just closed the current tab
    registry.registerHandlers({
      keybinding: 'alt shift t',
      commandId: Command.Default.VIEW_REOPEN_LAST_WIDGET,
    });

    // Close all tabs except the currently open tab
    registry.registerHandlers({
      keybinding: 'meta alt t',
      commandId: Command.Default.VIEW_CLOSE_OTHER_WIDGET,
    });

    // Close all tabs except the currently open tab
    registry.registerHandlers({
      keybinding: 'meta j',
      commandId: Command.Default.VIEW_CLOSE_BOTTOM_PANEL,
    });

    // Full screen mode
    registry.registerHandlers({
      keybinding: 'alt f',
      commandId: Command.Default.VIEW_FULL_SCREEN,
    });
  }
}
