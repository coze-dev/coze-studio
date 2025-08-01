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

import { I18n } from '@coze-arch/i18n';
import {
  definePluginCreator,
  type PluginCreator,
  MenuService,
  Command,
  CommandRegistry,
  ApplicationShell,
  type FlowDockPanel,
  TabBar,
  ShortcutsService,
} from '@coze-project-ide/client';

import { ViewService } from '../create-preset-plugin/view-service';

const CUSTOM_COMMAND = {
  // Open split screen on left
  SPLIT_LEFT: {
    id: 'view.custom.split-left',
    label: I18n.t('project_ide_tabs_open_on_left'),
  },
  // Open in split screen on the right
  SPLIT_RIGHT: {
    id: 'view.custom.split-right',
    label: I18n.t('project_ide_tabs_open_on_right'),
  },
  REFRESH: {
    id: 'view.custom.refresh-widget',
    label: I18n.t('refresh_project_tags'),
  },
};

function getAllTabsCount(dockPanel: FlowDockPanel): number {
  let count = 0;

  // Traverse all widgets in DockPanel
  Array.from(dockPanel.children()).forEach(widget => {
    if (widget instanceof TabBar) {
      // Accumulate all tab pages in TabBar
      count += widget.titles.length;
    }
  });

  return count;
}

export const createContextMenuPlugin: PluginCreator<void> = definePluginCreator(
  {
    onInit(ctx) {
      const menuService = ctx.container.get<MenuService>(MenuService);
      const command = ctx.container.get<CommandRegistry>(CommandRegistry);
      const viewService = ctx.container.get<ViewService>(ViewService);
      const shell = ctx.container.get<ApplicationShell>(ApplicationShell);
      const shortcutsService =
        ctx.container.get<ShortcutsService>(ShortcutsService);
      /**
       * Change the title
       */
      // Update command title label
      command.updateCommand(Command.Default.VIEW_CLOSE_CURRENT_WIDGET, {
        label: I18n.t('project_ide_tabs_close'),
      });
      command.updateCommand(Command.Default.VIEW_CLOSE_OTHER_WIDGET, {
        label: I18n.t('project_ide_tabs_close_other_tabs'),
      });
      command.updateCommand(Command.Default.VIEW_CLOSE_ALL_WIDGET, {
        label: I18n.t('project_ide_tabs_close_all'),
      });
      command.registerCommand(CUSTOM_COMMAND.REFRESH, {
        execute: widget => {
          widget.refresh();
        },
      });
      shortcutsService.registerHandlers({
        keybinding: 'alt r',
        commandId: CUSTOM_COMMAND.REFRESH.id,
      });
      command.registerCommand(CUSTOM_COMMAND.SPLIT_LEFT, {
        execute: widget => {
          viewService.splitScreen('left', widget);
        },
        // Split screen function can only be used when all tabs are greater than 1
        isEnabled: () => {
          const tabCounts = getAllTabsCount(shell.mainPanel);
          return tabCounts > 1;
        },
      });
      command.registerCommand(CUSTOM_COMMAND.SPLIT_RIGHT, {
        execute: widget => {
          viewService.splitScreen('right', widget);
        },
        // Split screen function can only be used when all tabs are greater than 1
        isEnabled: () => {
          const tabCounts = getAllTabsCount(shell.mainPanel);
          return tabCounts > 1;
        },
      });
      /**
       * Registration menu
       */
      // close
      menuService.addMenuItem({
        command: Command.Default.VIEW_CLOSE_CURRENT_WIDGET,
        selector: '.lm-TabBar-tab',
      });
      // Close other
      menuService.addMenuItem({
        command: Command.Default.VIEW_CLOSE_OTHER_WIDGET,
        selector: '.lm-TabBar-tab',
      });
      // Close all
      menuService.addMenuItem({
        command: Command.Default.VIEW_CLOSE_ALL_WIDGET,
        selector: '.lm-TabBar-tab',
      });
      // refresh label
      menuService.addMenuItem({
        command: CUSTOM_COMMAND.REFRESH.id,
        selector: '.lm-TabBar-tab',
      });
      // dividing line
      menuService.addMenuItem({
        type: 'separator',
        selector: '.lm-TabBar-tab',
      });
      // Split screen to the left
      menuService.addMenuItem({
        command: CUSTOM_COMMAND.SPLIT_LEFT.id,
        selector: '.lm-TabBar-tab',
      });
      // Split screen to the right
      menuService.addMenuItem({
        command: CUSTOM_COMMAND.SPLIT_RIGHT.id,
        selector: '.lm-TabBar-tab',
      });
    },
  },
);
