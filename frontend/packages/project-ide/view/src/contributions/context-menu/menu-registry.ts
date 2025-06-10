import type React from 'react';

import { inject, injectable } from 'inversify';
import { type LifecycleContribution } from '@coze-project-ide/core';

import { type Menu, MenuFactory } from './menu';
import { type CanHandle, ContextMenu } from './context-menu';

export const MenuService = Symbol('MenuService');

/**
 * menu service 注册
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
