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

import type React from 'react';

import { inject, injectable } from 'inversify';
import { type LifecycleContribution } from '@coze-project-ide/core';

import { type Menu, MenuFactory } from './menu';
import { type CanHandle, ContextMenu } from './context-menu';

export const MenuService = Symbol('MenuService');

/**
 * Menu service registration
 */
export interface MenuService {
  addMenuItem: (options: ContextMenu.IItemOptions) => void;

  createSubMenu: () => Menu;

  addSubMenuItem: (submenu: Menu, options: Menu.IItemOptions) => void;

  open: (event: React.MouseEvent, args?: any) => boolean;

  clearMenuItems: (canHandles: CanHandle[]) => void;

  close: () => void;
}

@injectable()
export class MenuRegistry implements MenuService, LifecycleContribution {
  @inject(ContextMenu) contextMenu: ContextMenu;

  @inject(MenuFactory) menuFactory: MenuFactory;

  onInit() {}

  clearMenuItems(canHandles: CanHandle[]) {
    canHandles.forEach(handle => {
      this.contextMenu.deleteItem(handle);
    });
  }

  clearMenuItem(canHandle: string | ((command: string) => boolean)) {
    if (typeof canHandle === 'string') {
    }
  }

  addMenuItem(options: ContextMenu.IItemOptions): void {
    this.contextMenu.addItem(options);
  }

  createSubMenu(): Menu {
    const submenu = this.menuFactory();
    return submenu;
  }

  addSubMenuItem(submenu: Menu, options: Menu.IItemOptions): void {
    submenu.addItem(options);
  }

  open(event: React.MouseEvent, args?: any): boolean {
    return this.contextMenu.open(event, args);
  }

  close() {
    this.contextMenu.close();
  }
}
