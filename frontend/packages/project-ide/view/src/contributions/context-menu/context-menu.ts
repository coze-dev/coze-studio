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

import { inject, injectable, postConstruct } from 'inversify';
import { Disposable } from '@flowgram-adapter/common';

import { Selector } from '../../lumino/domutils';
import { ArrayExt } from '../../lumino/algorithm';
import { Menu, MenuFactory } from './menu';

export type CanHandle = string | ((command?: string) => boolean);

/**
 * Global contextmenu listening
 */
@injectable()
export class ContextMenu {
  @inject(MenuFactory) menuFactory: MenuFactory;

  // Global Main Menu
  menu: Menu;

  @postConstruct()
  init() {
    this.menu = this.menuFactory();
  }

  /**
   * delete item
   */
  deleteItem(canHandle: CanHandle) {
    if (typeof canHandle === 'string') {
      // precise deletion
      const item = this._items.find(i => i.command === canHandle);
      ArrayExt.removeFirstOf(this._items, item);
    } else {
      // blur delete
      this._items.forEach(i => {
        if (canHandle(i.command)) {
          ArrayExt.removeFirstOf(this._items, i);
        }
      });
    }
  }

  /**
   * add item
   */
  addItem(options: ContextMenu.IItemOptions): Disposable {
    const item = Private.createItem(options, this._idTick++);

    this._items.push(item);

    return Disposable.create(() => {
      ArrayExt.removeFirstOf(this._items, item);
    });
  }

  /**
   * Manually close the menu
   */
  close() {
    this.menu.close();
  }

  /**
   * open event
   */
  open(event: React.MouseEvent, args?: any): boolean {
    Menu.saveWindowData();

    this.menu.clearItems();

    if (this._items.length === 0) {
      return false;
    }

    const items = Private.matchItems(
      this._items,
      event,
      this._groupByTarget,
      this._sortBySelector,
    );

    if (!items || items.length === 0) {
      return false;
    }

    for (const item of items) {
      if (args) {
        item.args = args;
      }
      if (item.filter && !item.filter(args)) {
        continue;
      }
      this.menu.addItem(item);
    }

    this.menu.open(event.clientX, event.clientY);

    return true;
  }

  private _groupByTarget = true;

  private _idTick = 0;

  private _items: Private.IItem[] = [];

  private _sortBySelector = true;
}

export namespace ContextMenu {
  export interface IOptions {
    renderer?: Menu.IRenderer;

    sortBySelector?: boolean;

    groupByTarget?: boolean;
  }

  /**
   * An options object for creating a context menu item.
   */
  export interface IItemOptions extends Menu.IItemOptions {
    /**
     * The CSS selector for the context menu item.
     *
     * The contextmenu event is triggered only when the current element is bubbling through the selector element.
     * The bottom layer is obtained through querySelector, and commas need to be added.
     */
    selector: string;

    /**
     * The default rank is `Infinity`.
     */
    rank?: number;
  }
}

namespace Private {
  export interface IItem extends Menu.IItemOptions {
    selector: string;

    rank: number;

    id: number;
  }

  /**
   * Create a normalized context menu item from an options object.
   */
  export function createItem(
    options: ContextMenu.IItemOptions,
    id: number,
  ): IItem {
    const selector = validateSelector(options.selector);
    const rank = options.rank !== undefined ? options.rank : Infinity;
    return { ...options, selector, rank, id };
  }

  export function matchItems(
    items: IItem[],
    event: React.MouseEvent,
    groupByTarget: boolean,
    sortBySelector: boolean,
  ): IItem[] | null {
    let target = event.target as Element | null;

    if (!target) {
      return null;
    }

    const currentTarget = event.currentTarget as Element | null;

    if (!currentTarget) {
      return null;
    }

    const result: IItem[] = [];

    const availableItems: Array<IItem | null> = items.slice();

    while (target !== null) {
      const matches: IItem[] = [];

      for (let i = 0, n = availableItems.length; i < n; ++i) {
        const item = availableItems[i];

        if (!item) {
          continue;
        }

        if (!Selector.matches(target, item.selector)) {
          continue;
        }

        matches.push(item);

        availableItems[i] = null;
      }

      if (matches.length !== 0) {
        if (groupByTarget) {
          matches.sort(sortBySelector ? itemCmp : itemCmpRank);
        }
        result.push(...matches);
      }

      if (target === currentTarget) {
        break;
      }

      target = target.parentElement;
    }

    if (!groupByTarget) {
      result.sort(sortBySelector ? itemCmp : itemCmpRank);
    }

    return result;
  }

  function validateSelector(selector: string): string {
    if (selector.indexOf(',') !== -1) {
      throw new Error(`Selector cannot contain commas: ${selector}`);
    }
    if (!Selector.isValid(selector)) {
      throw new Error(`Invalid selector: ${selector}`);
    }
    return selector;
  }

  function itemCmpRank(a: IItem, b: IItem): number {
    const r1 = a.rank;
    const r2 = b.rank;
    if (r1 !== r2) {
      return r1 < r2 ? -1 : 1; // Infinity-safe
    }

    return a.id - b.id;
  }

  /**
   * A sort comparison function for a context menu item by selectors and ranks.
   */
  function itemCmp(a: IItem, b: IItem): number {
    const s1 = Selector.calculateSpecificity(a.selector);
    const s2 = Selector.calculateSpecificity(b.selector);
    if (s1 !== s2) {
      return s2 - s1;
    }

    return itemCmpRank(a, b);
  }
}
