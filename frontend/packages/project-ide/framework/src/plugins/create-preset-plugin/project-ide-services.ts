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
  CommandService,
  MenuService,
  type URI,
  ContextKeyService,
} from '@coze-project-ide/client';

import {
  type ContextMenuService,
  type MenuItem,
  type CommandService as CustomCommandService,
} from '@/types/services';

import { ViewService } from './view-service';

/**
 * Acquire service operation
 * It can be called anywhere in the world
 * Command: Command system registration
 * Contextmenu: right-click menu registration
 * View: view operation
 */
@injectable()
export class ProjectIDEServices {
  @inject(CommandService)
  private commandService: CommandService;

  @inject(ContextKeyService)
  private contextKeyService: ContextKeyService;

  @inject(MenuService)
  private menu: MenuService;

  @inject(ViewService)
  public view: ViewService;

  private registerMenus(options: MenuItem[], match?: RegExp) {
    const filter = () => {
      const currentUri = this.contextKeyService.getContext(
        'widgetFocus',
      ) as URI;
      return Boolean(match?.test?.(currentUri.toString()));
    };
    options.forEach(option => {
      if (!option.submenu) {
        this.menu.addMenuItem({
          command: option.commandId,
          selector: option.selector,
          filter,
        });
      } else {
        const submenu = this.menu.createSubMenu();
        this.menu.addMenuItem({
          command: option.commandId,
          selector: option.selector,
          submenu,
          filter,
        });
        option.submenu.forEach(sub => {
          submenu.addItem({
            command: sub.commandId,
            filter,
          });
        });
      }
    });
  }

  public contextmenu: ContextMenuService = {
    registerContextMenu: (options: MenuItem[], match?: RegExp) => {
      this.registerMenus(options, match);
    },
    open: e => this.menu.open(e),
  };

  public command: CustomCommandService = {
    execute: (id, ...args) => {
      this.commandService.executeCommand(id, ...args);
    },
  };
}
