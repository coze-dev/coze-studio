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

// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
import { inject, injectable } from 'inversify';
import { logger } from '@flowgram-adapter/common';
import { CommandRegistry, ShortcutsService } from '@coze-project-ide/core';

import { HoverService } from '../../services/hover-service';
import { Widget } from '../../lumino/widgets';
import {
  type ARIAAttrNames,
  type ElementARIAAttrs,
  h,
  VirtualDOM,
  type VirtualElement,
} from '../../lumino/virtualdom';
import { type ISignal, Signal } from '../../lumino/signaling';
import { type Message, MessageLoop } from '../../lumino/messaging';
import { ElementExt } from '../../lumino/domutils';
import { ArrayExt } from '../../lumino/algorithm';

interface IWindowData {
  pageXOffset: number;
  pageYOffset: number;
  clientWidth: number;
  clientHeight: number;
}

export const MenuFactory = Symbol('MenuFactory');
export type MenuFactory = () => Menu;

/**
 * A widget which displays items as a canonical menu.
 */
@injectable()
export class Menu extends Widget {
  @inject(ShortcutsService) shortcutsService: ShortcutsService;

  @inject(CommandRegistry) commands: CommandRegistry;

  @inject(HoverService) hoverService: HoverService;

  /**
   * Construct a new menu.
   *
   * @param options - The options for initializing the menu.
   */
  constructor() {
    super({ node: Private.createNode() });
    this.addClass('flow-Menu');
    this.setFlag(Widget.Flag.DisallowLayout);
    this.renderer = Menu.defaultRenderer;
  }

  /**
   * Dispose of the resources held by the menu.
   */
  dispose(): void {
    this.close();
    this._items.length = 0;
    super.dispose();
  }

  /**
   * A signal emitted just before the menu is closed.
   *
   * #### Notes
   * This signal is emitted when the menu receives a `'close-request'`
   * message, just before it removes itself from the DOM.
   *
   * This signal is not emitted if the menu is already detached from
   * the DOM when it receives the `'close-request'` message.
   */
  get aboutToClose(): ISignal<this, void> {
    return this._aboutToClose;
  }

  /**
   * A signal emitted when a new menu is requested by the user.
   *
   * #### Notes
   * This signal is emitted whenever the user presses the right or left
   * arrow keys, and a submenu cannot be opened or closed in response.
   *
   * This signal is useful when implementing menu bars in order to open
   * the next or previous menu in response to a user key press.
   *
   * This signal is only emitted for the root menu in a hierarchy.
   */
  get menuRequested(): ISignal<this, 'next' | 'previous'> {
    return this._menuRequested;
  }

  /**
   * The renderer used by the menu.
   */
  readonly renderer: Menu.IRenderer;

  /**
   * The parent menu of the menu.
   *
   * #### Notes
   * This is `null` unless the menu is an open submenu.
   */
  get parentMenu(): Menu | null {
    return this._parentMenu;
  }

  /**
   * The child menu of the menu.
   *
   * #### Notes
   * This is `null` unless the menu has an open submenu.
   */
  get childMenu(): Menu | null {
    return this._childMenu;
  }

  /**
   * The root menu of the menu hierarchy.
   */
  get rootMenu(): Menu {
    let menu: Menu = this;
    while (menu._parentMenu) {
      menu = menu._parentMenu;
    }
    return menu;
  }

  /**
   * The leaf menu of the menu hierarchy.
   */
  get leafMenu(): Menu {
    let menu: Menu = this;
    while (menu._childMenu) {
      menu = menu._childMenu;
    }
    return menu;
  }

  /**
   * The menu content node.
   *
   * #### Notes
   * This is the node which holds the menu item nodes.
   *
   * Modifying this node directly can lead to undefined behavior.
   */
  get contentNode(): HTMLUListElement {
    return this.node.getElementsByClassName(
      'flow-Menu-content',
    )[0] as HTMLUListElement;
  }

  /**
   * Get the currently active menu item.
   */
  get activeItem(): Menu.IItem | null {
    return this._items[this._activeIndex] || null;
  }

  /**
   * Set the currently active menu item.
   *
   * #### Notes
   * If the item cannot be activated, the item will be set to `null`.
   */
  set activeItem(value: Menu.IItem | null) {
    this.activeIndex = value ? this._items.indexOf(value) : -1;
  }

  /**
   * Get the index of the currently active menu item.
   *
   * #### Notes
   * This will be `-1` if no menu item is active.
   */
  get activeIndex(): number {
    return this._activeIndex;
  }

  /**
   * Set the index of the currently active menu item.
   *
   * #### Notes
   * If the item cannot be activated, the index will be set to `-1`.
   */
  set activeIndex(value: number) {
    // Adjust the value for an out of range index.
    if (value < 0 || value >= this._items.length) {
      value = -1;
    }

    // Ensure the item can be activated.
    if (value !== -1 && !Private.canActivate(this._items[value])) {
      value = -1;
    }

    // Bail if the index will not change.
    if (this._activeIndex === value) {
      return;
    }

    // Update the active index.
    this._activeIndex = value;

    // Make active element in focus
    if (
      this._activeIndex >= 0 &&
      this.contentNode.childNodes[this._activeIndex]
    ) {
      (this.contentNode.childNodes[this._activeIndex] as HTMLElement).focus();
    }

    // schedule an update of the items.
    this.update();
  }

  /**
   * A read-only array of the menu items in the menu.
   */
  get items(): ReadonlyArray<Menu.IItem> {
    return this._items;
  }

  /**
   * Activate the next selectable item in the menu.
   *
   * #### Notes
   * If no item is selectable, the index will be set to `-1`.
   */
  activateNextItem(): void {
    const n = this._items.length;
    const ai = this._activeIndex;
    const start = ai < n - 1 ? ai + 1 : 0;
    const stop = start === 0 ? n - 1 : start - 1;
    this.activeIndex = ArrayExt.findFirstIndex(
      this._items,
      Private.canActivate,
      start,
      stop,
    );
  }

  /**
   * Activate the previous selectable item in the menu.
   *
   * #### Notes
   * If no item is selectable, the index will be set to `-1`.
   */
  activatePreviousItem(): void {
    const n = this._items.length;
    const ai = this._activeIndex;
    const start = ai <= 0 ? n - 1 : ai - 1;
    const stop = start === n - 1 ? 0 : start + 1;
    this.activeIndex = ArrayExt.findLastIndex(
      this._items,
      Private.canActivate,
      start,
      stop,
    );
  }

  /**
   * Trigger the active menu item.
   *
   * #### Notes
   * If the active item is a submenu, it will be opened and the first
   * item will be activated.
   *
   * If the active item is a command, the command will be executed.
   *
   * If the menu is not attached, this is a no-op.
   *
   * If there is no active item, this is a no-op.
   */
  triggerActiveItem(): void {
    // Bail if the menu is not attached.
    if (!this.isAttached) {
      return;
    }

    // Bail if there is no active item.
    const item = this.activeItem;
    if (!item) {
      return;
    }

    // Cancel the pending timers.
    this._cancelOpenTimer();
    this._cancelCloseTimer();

    // If the item is a submenu, open it.
    if (item.type === 'submenu') {
      this._openChildMenu(true);
      return;
    }

    // Close the root menu before executing the command.
    this.rootMenu.close();

    // Execute the command for the item.
    const { command, args } = item;
    if (this.commands.isEnabled(command, args)) {
      this.commands.executeCommand(command, args);
    } else {
      logger.log(`Menu [error] Command '${command}' is disabled.`);
    }
  }

  /**
   * Add a menu item to the end of the menu.
   *
   * @param options - The options for creating the menu item.
   *
   * @returns The menu item added to the menu.
   */
  addItem(options: Menu.IItemOptions): Menu.IItem {
    return this.insertItem(this._items.length, options);
  }

  /**
   * Insert a menu item into the menu at the specified index.
   *
   * @param index - The index at which to insert the item.
   *
   * @param options - The options for creating the menu item.
   *
   * @returns The menu item added to the menu.
   *
   * #### Notes
   * The index will be clamped to the bounds of the items.
   */
  insertItem(index: number, options: Menu.IItemOptions): Menu.IItem {
    // Close the menu if it's attached.
    if (this.isAttached) {
      this.close();
    }

    // Reset the active index.
    this.activeIndex = -1;

    // Clamp the insert index to the array bounds.
    const i = Math.max(0, Math.min(index, this._items.length));

    // Create the item for the options.
    const item = Private.createItem(this, options);

    // Insert the item into the array.
    ArrayExt.insert(this._items, i, item);

    // Schedule an update of the items.
    this.update();

    // Return the item added to the menu.
    return item;
  }

  /**
   * Remove an item from the menu.
   *
   * @param item - The item to remove from the menu.
   *
   * #### Notes
   * This is a no-op if the item is not in the menu.
   */
  removeItem(item: Menu.IItem): void {
    this.removeItemAt(this._items.indexOf(item));
  }

  /**
   * Remove the item at a given index from the menu.
   *
   * @param index - The index of the item to remove.
   *
   * #### Notes
   * This is a no-op if the index is out of range.
   */
  removeItemAt(index: number): void {
    // Close the menu if it's attached.
    if (this.isAttached) {
      this.close();
    }

    // Reset the active index.
    this.activeIndex = -1;

    // Remove the item from the array.
    const item = ArrayExt.removeAt(this._items, index);

    // Bail if the index is out of range.
    if (!item) {
      return;
    }

    // Schedule an update of the items.
    this.update();
  }

  /**
   * Remove all menu items from the menu.
   */
  clearItems(): void {
    // Close the menu if it's attached.
    if (this.isAttached) {
      this.close();
    }

    // Reset the active index.
    this.activeIndex = -1;

    // Bail if there is nothing to remove.
    if (this._items.length === 0) {
      return;
    }

    // Clear the items.
    this._items.length = 0;

    // Schedule an update of the items.
    this.update();
  }

  /**
   * Open the menu at the specified location.
   *
   * @param x - The client X coordinate of the menu location.
   *
   * @param y - The client Y coordinate of the menu location.
   *
   * @param options - The additional options for opening the menu.
   *
   * #### Notes
   * The menu will be opened at the given location unless it will not
   * fully fit on the screen. If it will not fit, it will be adjusted
   * to fit naturally on the screen.
   *
   * This is a no-op if the menu is already attached to the DOM.
   */
  open(x: number, y: number, options: Menu.IOpenOptions = {}): void {
    // Bail early if the menu is already attached.
    if (this.isAttached) {
      return;
    }

    // Extract the position options.
    const forceX = options.forceX || false;
    const forceY = options.forceY || false;

    // Open the menu as a root menu.
    Private.openRootMenu(this, x, y, forceX, forceY);

    // Activate the menu to accept keyboard input.
    this.activate();
  }

  /**
   * Handle the DOM events for the menu.
   *
   * @param event - The DOM event sent to the menu.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the menu's DOM nodes. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'keydown':
        this._evtKeyDown(event as KeyboardEvent);
        break;
      case 'mouseup':
        this._evtMouseUp(event as MouseEvent);
        break;
      case 'mousemove':
        this._evtMouseMove(event as MouseEvent);
        break;
      case 'mouseenter':
        this._evtMouseEnter(event as MouseEvent);
        break;
      case 'mouseleave':
        this._evtMouseLeave(event as MouseEvent);
        break;
      case 'mousedown':
        this._evtMouseDown(event as MouseEvent);
        break;
      case 'contextmenu':
        event.preventDefault();
        event.stopPropagation();
        break;
    }
  }

  /**
   * A message handler invoked on a `'before-attach'` message.
   */
  protected onBeforeAttach(msg: Message): void {
    this.node.addEventListener('keydown', this);
    this.node.addEventListener('mouseup', this);
    this.node.addEventListener('mousemove', this);
    this.node.addEventListener('mouseenter', this);
    this.node.addEventListener('mouseleave', this);
    this.node.addEventListener('contextmenu', this);
    document.addEventListener('mousedown', this, true);
  }

  /**
   * A message handler invoked on an `'after-detach'` message.
   */
  protected onAfterDetach(msg: Message): void {
    this.node.removeEventListener('keydown', this);
    this.node.removeEventListener('mouseup', this);
    this.node.removeEventListener('mousemove', this);
    this.node.removeEventListener('mouseenter', this);
    this.node.removeEventListener('mouseleave', this);
    this.node.removeEventListener('contextmenu', this);
    document.removeEventListener('mousedown', this, true);
  }

  /**
   * A message handler invoked on an `'activate-request'` message.
   */
  protected onActivateRequest(msg: Message): void {
    if (this.isAttached) {
      this.node.focus();
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    const items = this._items;
    const { renderer } = this;
    const activeIndex = this._activeIndex;
    const collapsedFlags = Private.computeCollapsed(items);
    const content = new Array<VirtualElement>(items.length);
    for (let i = 0, n = items.length; i < n; ++i) {
      const item = items[i];
      const active = i === activeIndex;
      const collapsed = collapsedFlags[i];
      const tooltip =
        typeof item.tooltip === 'string'
          ? item.tooltip
          : item.tooltip?.({
              disabled: !item.isEnabled,
            });
      content[i] = renderer.renderItem(
        {
          item,
          active,
          collapsed,
          onfocus: () => {
            this.activeIndex = i;
          },
          onmouseenter: (e: MouseEvent) => {
            this.hoverService.requestHover({
              content: tooltip,
              target: e.currentTarget as HTMLElement,
              position: 'right',
              offset: 4,
            });
          },
        },
        this.commands,
        this.shortcutsService,
      );
    }
    VirtualDOM.render(content, this.contentNode);
  }

  /**
   * A message handler invoked on a `'close-request'` message.
   */
  protected onCloseRequest(msg: Message): void {
    // Cancel the pending timers.
    this._cancelOpenTimer();
    this._cancelCloseTimer();

    // Reset the active index.
    this.activeIndex = -1;

    // Close any open child menu.
    const childMenu = this._childMenu;
    if (childMenu) {
      this._childIndex = -1;
      this._childMenu = null;
      childMenu._parentMenu = null;
      childMenu.close();
    }

    // Remove this menu from its parent and activate the parent.
    const parentMenu = this._parentMenu;
    if (parentMenu) {
      this._parentMenu = null;
      parentMenu._childIndex = -1;
      parentMenu._childMenu = null;
      parentMenu.activate();
    }

    // Emit the `aboutToClose` signal if the menu is attached.
    if (this.isAttached) {
      this._aboutToClose.emit(undefined);
    }

    // Finish closing the menu.
    super.onCloseRequest(msg);
  }

  /**
   * Handle the `'keydown'` event for the menu.
   *
   * #### Notes
   * This listener is attached to the menu node.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    // A menu handles all keydown events.
    event.preventDefault();
    event.stopPropagation();

    // Fetch the key code for the event.
    const kc = event.keyCode;

    // Enter
    if (kc === 13) {
      this.triggerActiveItem();
      return;
    }

    // Escape
    if (kc === 27) {
      this.close();
      return;
    }

    // Left Arrow
    if (kc === 37) {
      if (this._parentMenu) {
        this.close();
      } else {
        this._menuRequested.emit('previous');
      }
      return;
    }

    // Up Arrow
    if (kc === 38) {
      this.activatePreviousItem();
      return;
    }

    // Right Arrow
    if (kc === 39) {
      const item = this.activeItem;
      if (item && item.type === 'submenu') {
        this.triggerActiveItem();
      } else {
        this.rootMenu._menuRequested.emit('next');
      }
      return;
    }

    // Down Arrow
    if (kc === 40) {
      this.activateNextItem();
      return;
    }
  }

  /**
   * Handle the `'mouseup'` event for the menu.
   *
   * #### Notes
   * This listener is attached to the menu node.
   */
  private _evtMouseUp(event: MouseEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.triggerActiveItem();
  }

  /**
   * Handle the `'mousemove'` event for the menu.
   *
   * #### Notes
   * This listener is attached to the menu node.
   */
  private _evtMouseMove(event: MouseEvent): void {
    // Hit test the item nodes for the item under the mouse.
    let index = ArrayExt.findFirstIndex(this.contentNode.children, node =>
      ElementExt.hitTest(node, event.clientX, event.clientY),
    );

    // Bail early if the mouse is already over the active index.
    if (index === this._activeIndex) {
      return;
    }

    // Update and coerce the active index.
    this.activeIndex = index;
    index = this.activeIndex;

    // If the index is the current child index, cancel the timers.
    if (index === this._childIndex) {
      this._cancelOpenTimer();
      this._cancelCloseTimer();
      return;
    }

    // If a child menu is currently open, start the close timer.
    if (this._childIndex !== -1) {
      this._startCloseTimer();
    }

    // Cancel the open timer to give a full delay for opening.
    this._cancelOpenTimer();

    // Bail if the active item is not a valid submenu item.
    const item = this.activeItem;
    if (!item || item.type !== 'submenu' || !item.submenu) {
      return;
    }

    // Start the open timer to open the active item submenu.
    this._startOpenTimer();
  }

  /**
   * Handle the `'mouseenter'` event for the menu.
   *
   * #### Notes
   * This listener is attached to the menu node.
   */
  private _evtMouseEnter(event: MouseEvent): void {
    // Synchronize the active ancestor items.
    for (let menu = this._parentMenu; menu; menu = menu._parentMenu) {
      menu._cancelOpenTimer();
      menu._cancelCloseTimer();
      menu.activeIndex = menu._childIndex;
    }
  }

  /**
   * Handle the `'mouseleave'` event for the menu.
   *
   * #### Notes
   * This listener is attached to the menu node.
   */
  private _evtMouseLeave(event: MouseEvent): void {
    // Cancel any pending submenu opening.
    this._cancelOpenTimer();

    // If there is no open child menu, just reset the active index.
    if (!this._childMenu) {
      this.activeIndex = -1;
      return;
    }

    // If the mouse is over the child menu, cancel the close timer.
    const { clientX, clientY } = event;
    if (ElementExt.hitTest(this._childMenu.node, clientX, clientY)) {
      this._cancelCloseTimer();
      return;
    }

    // Otherwise, reset the active index and start the close timer.
    this.activeIndex = -1;
    this._startCloseTimer();
  }

  /**
   * Handle the `'mousedown'` event for the menu.
   *
   * #### Notes
   * This listener is attached to the document node.
   */
  private _evtMouseDown(event: MouseEvent): void {
    // Bail if the menu is not a root menu.
    if (this._parentMenu) {
      return;
    }

    // The mouse button which is pressed is irrelevant. If the press
    // is not on a menu, the entire hierarchy is closed and the event
    // is allowed to propagate. This allows other code to act on the
    // event, such as focusing the clicked element.
    if (Private.hitTestMenus(this, event.clientX, event.clientY)) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.close();
    }
  }

  /**
   * Open the child menu at the active index immediately.
   *
   * If a different child menu is already open, it will be closed,
   * even if the active item is not a valid submenu.
   */
  private _openChildMenu(activateFirst = false): void {
    // If the item is not a valid submenu, close the child menu.
    const item = this.activeItem;
    if (!item || item.type !== 'submenu' || !item.submenu) {
      this._closeChildMenu();
      return;
    }

    // Do nothing if the child menu will not change.
    const { submenu } = item;
    if (submenu === this._childMenu) {
      return;
    }

    // Prior to any DOM modifications save window data
    Menu.saveWindowData();

    // Ensure the current child menu is closed.
    this._closeChildMenu();

    // Update the private child state.
    this._childMenu = submenu;
    this._childIndex = this._activeIndex;

    // Set the parent menu reference for the child.
    submenu._parentMenu = this;

    // Ensure the menu is updated and lookup the item node.
    MessageLoop.sendMessage(this, Widget.Msg.UpdateRequest);
    const itemNode = this.contentNode.children[this._activeIndex];

    // Open the submenu at the active node.
    Private.openSubmenu(submenu, itemNode as HTMLElement);

    // Activate the first item if desired.
    if (activateFirst) {
      submenu.activeIndex = -1;
      submenu.activateNextItem();
    }

    // Activate the child menu.
    submenu.activate();
  }

  /**
   * Close the child menu immediately.
   *
   * This is a no-op if a child menu is not open.
   */
  private _closeChildMenu(): void {
    if (this._childMenu) {
      this._childMenu.close();
    }
  }

  /**
   * Start the open timer, unless it is already pending.
   */
  private _startOpenTimer(): void {
    if (this._openTimerID === 0) {
      this._openTimerID = window.setTimeout(() => {
        this._openTimerID = 0;
        this._openChildMenu();
      }, Private.TIMER_DELAY);
    }
  }

  /**
   * Start the close timer, unless it is already pending.
   */
  private _startCloseTimer(): void {
    if (this._closeTimerID === 0) {
      this._closeTimerID = window.setTimeout(() => {
        this._closeTimerID = 0;
        this._closeChildMenu();
      }, Private.TIMER_DELAY);
    }
  }

  /**
   * Cancel the open timer, if the timer is pending.
   */
  private _cancelOpenTimer(): void {
    if (this._openTimerID !== 0) {
      clearTimeout(this._openTimerID);
      this._openTimerID = 0;
    }
  }

  /**
   * Cancel the close timer, if the timer is pending.
   */
  private _cancelCloseTimer(): void {
    if (this._closeTimerID !== 0) {
      clearTimeout(this._closeTimerID);
      this._closeTimerID = 0;
    }
  }

  /**
   * Save window data used for menu positioning in transient cache.
   *
   * In order to avoid layout trashing it is recommended to invoke this
   * method immediately prior to opening the menu and any DOM modifications
   * (like closing previously visible menu, or adding a class to menu widget).
   *
   * The transient cache will be released upon `open()` call.
   */
  static saveWindowData(): void {
    Private.saveWindowData();
  }

  private _childIndex = -1;

  private _activeIndex = -1;

  private _openTimerID = 0;

  private _closeTimerID = 0;

  private _items: Menu.IItem[] = [];

  private _childMenu: Menu | null = null;

  private _parentMenu: Menu | null = null;

  private _aboutToClose = new Signal<this, void>(this);

  private _menuRequested = new Signal<this, 'next' | 'previous'>(this);
}

/**
 * The namespace for the `Menu` class statics.
 */
export namespace Menu {
  /**
   * An options object for the `open` method on a menu.
   */
  export interface IOpenOptions {
    /**
     * Whether to force the X position of the menu.
     *
     * Setting to `true` will disable the logic which repositions the
     * X coordinate of the menu if it will not fit entirely on screen.
     *
     * The default is `false`.
     */
    forceX?: boolean;

    /**
     * Whether to force the Y position of the menu.
     *
     * Setting to `true` will disable the logic which repositions the
     * Y coordinate of the menu if it will not fit entirely on screen.
     *
     * The default is `false`.
     */
    forceY?: boolean;
  }

  /**
   * A type alias for a menu item type.
   */
  export type ItemType = 'command' | 'submenu' | 'separator';

  /**
   * An options object for creating a menu item.
   */
  export interface IItemOptions {
    /**
     * The type of the menu item.
     *
     * The default value is `'command'`.
     */
    type?: ItemType;

    /**
     * The command to execute when the item is triggered.
     *
     * The default value is an empty string.
     */
    command?: string;

    /**
     * The arguments for the command.
     *
     * The default value is an empty object.
     */
    args?: any;

    /**
     * The submenu for a `'submenu'` type item.
     *
     * The default value is `null`.
     */
    submenu?: Menu | null;

    /**
     * custom shortcut
     * Specially reserved for third-party shortcuts
     */
    customShortcut?: string;

    /**
     * Echo tooltip copy
     */
    tooltip?: string | ((props: { disabled?: boolean }) => string);

    /**
     * Only those that return true will be retained in the menu echo.
     * The default is not passed, and the selector condition will definitely be echoed in the menu.
     * Disabled Control via command isEnabled
     */
    filter?: (args: any) => boolean;
  }

  /**
   * An object which represents a menu item.
   *
   * #### Notes
   * Item objects are created automatically by a menu.
   */
  export interface IItem {
    /**
     * The type of the menu item.
     */
    readonly type: ItemType;

    /**
     * The command to execute when the item is triggered.
     */
    readonly command: string;

    /**
     * The arguments for the command.
     */
    readonly args: any;

    /**
     * The submenu for a `'submenu'` type item.
     */
    readonly submenu: Menu | null;

    /**
     * The display label for the menu item.
     */
    readonly label: string;

    /** Not recommended, compatible with extreme scenes. custom shortcut string, without ShortcutService */
    readonly customShortcut?: string;

    /**
     * The mnemonic index for the menu item.
     */
    readonly mnemonic: number;

    /**
     * The icon renderer for the menu item.
     */
    readonly icon: VirtualElement.IRenderer | undefined;

    /**
     * The icon class for the menu item.
     */
    readonly iconClass: string;

    /**
     * The icon label for the menu item.
     */
    readonly iconLabel: string;

    /**
     * The display caption for the menu item.
     */
    readonly caption: string;

    /**
     * The extra class name for the menu item.
     */
    readonly className: string;

    /**
     * Whether the menu item is enabled.
     */
    readonly isEnabled: boolean;

    /**
     * Whether the menu item is toggled.
     */
    readonly isToggled: boolean;

    /**
     * Whether the menu item is visible.
     */
    readonly isVisible: boolean;

    /**
     * The key binding for the menu item.
     */
    readonly keyBinding: null;

    /** Tooltip content */
    readonly tooltip?: string | ((props: { disabled?: boolean }) => string);
  }

  /**
   * An object which holds the data to render a menu item.
   */
  export interface IRenderData {
    /**
     * The item to be rendered.
     */
    readonly item: IItem;

    /**
     * Whether the item is the active item.
     */
    readonly active: boolean;

    /**
     * Whether the item should be collapsed.
     */
    readonly collapsed: boolean;

    /**
     * Handler for when element is in focus.
     */
    readonly onfocus?: () => void;

    readonly onmouseenter?: (e: MouseEvent) => void;
  }

  /**
   * A renderer for use with a menu.
   */
  export interface IRenderer {
    /**
     * Render the virtual element for a menu item.
     *
     * @param data - The data to use for rendering the item.
     *
     * @returns A virtual element representing the item.
     */
    renderItem(
      data: IRenderData,
      commands: CommandRegistry,
      shortcutsService: ShortcutsService,
    ): VirtualElement;
  }

  /**
   * The default implementation of `IRenderer`.
   *
   * #### Notes
   * Subclasses are free to reimplement rendering methods as needed.
   */
  export class Renderer implements IRenderer {
    /**
     * Render the virtual element for a menu item.
     *
     * @param data - The data to use for rendering the item.
     *
     * @returns A virtual element representing the item.
     */
    renderItem(
      data: IRenderData,
      commands: CommandRegistry,
      shortcutsService: ShortcutsService,
    ): VirtualElement {
      const className = this.createItemClass(data);
      const aria = this.createItemARIA(data);
      const hasSubMenu = data.item.submenu;
      const renderArray = [
        this.renderLabel(data, commands),
        this.renderShortcut(data, shortcutsService),
      ];
      if (hasSubMenu) {
        renderArray.push(this.renderSubmenu(data));
      }
      const tooltip = data?.item?.tooltip;

      return h.div(
        {
          className,
          tabindex: '0',
          onfocus: data.onfocus,
          ...aria,
          ...(tooltip ? { onmouseenter: data.onmouseenter } : {}),
        },
        ...renderArray,
      );
    }

    /**
     * Render the label element for a menu item.
     *
     * @param data - The data to use for rendering the label.
     *
     * @returns A virtual element representing the item label.
     */
    renderLabel(data: IRenderData, commands: CommandRegistry): VirtualElement {
      const content = this.formatLabel(data, commands);
      return h.div({ className: 'flow-Menu-itemLabel' }, content);
    }

    /**
     * Render the shortcut element for a menu item.
     *
     * @param data - The data to use for rendering the shortcut.
     *
     * @returns A virtual element representing the item shortcut.
     */
    renderShortcut(
      data: IRenderData,
      shortcutsService: ShortcutsService,
    ): VirtualElement {
      let content = '';
      const { command, customShortcut } = data.item;
      const keybindings = shortcutsService.getShortcutByCommandId(command);
      if (keybindings) {
        content = keybindings.map(k => k.join(' ')).join(' / ');
      }
      if (customShortcut) {
        content = customShortcut;
      }
      return h.div({ className: 'flow-Menu-itemShortcut' }, content);
    }

    /**
     * Render the submenu icon element for a menu item.
     *
     * @param data - The data to use for rendering the submenu icon.
     *
     * @returns A virtual element representing the submenu icon.
     */
    renderSubmenu(data: IRenderData): VirtualElement {
      const hasSubMenu = data.item.submenu;
      return h.div({
        className: hasSubMenu ? 'flow-Menu-itemSubmenuIcon' : '',
      });
    }

    /**
     * Create the class name for the menu item.
     *
     * @param data - The data to use for the class name.
     *
     * @returns The full class name for the menu item.
     */
    createItemClass(data: IRenderData): string {
      // Setup the initial class name.
      let name = 'flow-Menu-item';

      // Add the boolean state classes.
      if (!data.item.isEnabled) {
        name += ' flow-mod-disabled';
      }
      if (data.item.isToggled) {
        name += ' flow-mod-toggled';
      }
      if (!data.item.isVisible) {
        name += ' flow-mod-hidden';
      }
      if (data.active) {
        name += ' flow-mod-active';
      }
      if (data.collapsed) {
        name += ' flow-mod-collapsed';
      }

      // Add the extra class.
      const extra = data.item.className;
      if (extra) {
        name += ` ${extra}`;
      }

      // Return the complete class name.
      return name;
    }

    /**
     * Create the aria attributes for menu item.
     *
     * @param data - The data to use for the aria attributes.
     *
     * @returns The aria attributes object for the item.
     */
    createItemARIA(data: IRenderData): ElementARIAAttrs {
      const aria: { [T in ARIAAttrNames]?: string } = {};
      switch (data.item.type) {
        case 'separator':
          aria.role = 'presentation';
          break;
        case 'submenu':
          aria['aria-haspopup'] = 'true';
          if (!data.item.isEnabled) {
            aria['aria-disabled'] = 'true';
          }
          break;
        default:
          if (!data.item.isEnabled) {
            aria['aria-disabled'] = 'true';
          }
          aria.role = 'menuitem';
      }
      return aria;
    }

    /**
     * Create the render content for the label node.
     *
     * @param data - The data to use for the label content.
     *
     * @returns The content to add to the label node.
     */
    formatLabel(data: IRenderData, commands: CommandRegistry): h.Child {
      // Fetch the label text and mnemonic index.
      const { command } = data.item;
      const label = commands.getCommand(command)?.label;

      // Wrap the mnemonic character in a span.
      const span = h.span({ className: 'flow-Menu-itemMnemonic' }, label || '');

      // Return the content parts.
      return [span];
    }
  }

  /**
   * The default `Renderer` instance.
   */
  export const defaultRenderer = new Renderer();
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * The ms delay for opening and closing a submenu.
   */
  export const TIMER_DELAY = 300;

  /**
   * The horizontal pixel overlap for an open submenu.
   */
  export const SUBMENU_OVERLAP = 3;

  let transientWindowDataCache: IWindowData | null = null;
  let transientCacheCounter = 0;

  function getWindowData(): IWindowData {
    // if transient cache is in use, take one from it
    if (transientCacheCounter > 0) {
      transientCacheCounter--;
      return transientWindowDataCache!;
    }
    return _getWindowData();
  }

  /**
   * Store window data in transient cache.
   *
   * The transient cache will be released upon `getWindowData()` call.
   * If this function is called multiple times, the cache will be
   * retained until as many calls to `getWindowData()` were made.
   *
   * Note: should be called before any DOM modifications.
   */
  export function saveWindowData(): void {
    transientWindowDataCache = _getWindowData();
    transientCacheCounter++;
  }

  /**
   * Create the DOM node for a menu.
   */
  export function createNode(): HTMLDivElement {
    const node = document.createElement('div');
    const content = document.createElement('ul');
    content.className = 'flow-Menu-content';
    node.appendChild(content);
    content.setAttribute('role', 'menu');
    node.tabIndex = 0;
    return node;
  }

  /**
   * Test whether a menu item can be activated.
   */
  export function canActivate(item: Menu.IItem): boolean {
    return item.type !== 'separator' && item.isEnabled && item.isVisible;
  }

  /**
   * Create a new menu item for an owner menu.
   */
  export function createItem(
    owner: Menu,
    options: Menu.IItemOptions,
  ): Menu.IItem {
    return new MenuItem(owner.commands, options);
  }

  /**
   * Hit test a menu hierarchy starting at the given root.
   */
  export function hitTestMenus(menu: Menu, x: number, y: number): boolean {
    for (let temp: Menu | null = menu; temp; temp = temp.childMenu) {
      if (ElementExt.hitTest(temp.node, x, y)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Compute which extra separator items should be collapsed.
   */
  export function computeCollapsed(
    items: ReadonlyArray<Menu.IItem>,
  ): boolean[] {
    // Allocate the return array and fill it with `false`.
    const result = new Array<boolean>(items.length);
    ArrayExt.fill(result, false);

    // Collapse the leading separators.
    let k1 = 0;
    const n = items.length;
    for (; k1 < n; ++k1) {
      const item = items[k1];
      if (!item.isVisible) {
        continue;
      }
      if (item.type !== 'separator') {
        break;
      }
      result[k1] = true;
    }

    // Hide the trailing separators.
    let k2 = n - 1;
    for (; k2 >= 0; --k2) {
      const item = items[k2];
      if (!item.isVisible) {
        continue;
      }
      if (item.type !== 'separator') {
        break;
      }
      result[k2] = true;
    }

    // Hide the remaining consecutive separators.
    let hide = false;
    while (++k1 < k2) {
      const item = items[k1];
      if (!item.isVisible) {
        continue;
      }
      if (item.type !== 'separator') {
        hide = false;
      } else if (hide) {
        result[k1] = true;
      } else {
        hide = true;
      }
    }

    // Return the resulting flags.
    return result;
  }

  function _getWindowData(): IWindowData {
    return {
      pageXOffset: window.pageXOffset,
      pageYOffset: window.pageYOffset,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
    };
  }

  /**
   * Open a menu as a root menu at the target location.
   */
  export function openRootMenu(
    menu: Menu,
    x: number,
    y: number,
    forceX: boolean,
    forceY: boolean,
  ): void {
    // Get the current position and size of the main viewport.
    const windowData = getWindowData();
    const px = windowData.pageXOffset;
    const py = windowData.pageYOffset;
    const cw = windowData.clientWidth;
    const ch = windowData.clientHeight;

    // Ensure the menu is updated before attaching and measuring.
    MessageLoop.sendMessage(menu, Widget.Msg.UpdateRequest);

    // Compute the maximum allowed height for the menu.
    const maxHeight = ch - (forceY ? y : 0);

    // Fetch common variables.
    const { node } = menu;
    const { style } = node;

    // Clear the menu geometry and prepare it for measuring.
    style.opacity = '0';
    style.maxHeight = `${maxHeight}px`;

    // Attach the menu to the document.
    Widget.attach(menu, document.body);

    // Measure the size of the menu.
    const { width, height } = node.getBoundingClientRect();

    // Adjust the X position of the menu to fit on-screen.
    if (!forceX && x + width > px + cw) {
      x = px + cw - width;
    }

    // Adjust the Y position of the menu to fit on-screen.
    if (!forceY && y + height > py + ch) {
      if (y > py + ch) {
        y = py + ch - height;
      } else {
        y = y - height;
      }
    }

    // Update the position of the menu to the computed position.
    style.transform = `translate(${Math.max(0, x)}px, ${Math.max(0, y)}px`;

    // Finally, make the menu visible on the screen.
    style.opacity = '1';
  }

  /**
   * Open a menu as a submenu using an item node for positioning.
   */
  export function openSubmenu(submenu: Menu, itemNode: HTMLElement): void {
    // Get the current position and size of the main viewport.
    const windowData = getWindowData();
    const px = windowData.pageXOffset;
    const py = windowData.pageYOffset;
    const cw = windowData.clientWidth;
    const ch = windowData.clientHeight;

    // Ensure the menu is updated before opening.
    MessageLoop.sendMessage(submenu, Widget.Msg.UpdateRequest);

    // Compute the maximum allowed height for the menu.
    const maxHeight = ch;

    // Fetch common variables.
    const { node } = submenu;
    const { style } = node;

    // Clear the menu geometry and prepare it for measuring.
    style.opacity = '0';
    style.maxHeight = `${maxHeight}px`;

    // Attach the menu to the document.
    Widget.attach(submenu, document.body);

    // Measure the size of the menu.
    const { width, height } = node.getBoundingClientRect();

    // Compute the box sizing for the menu.
    const box = ElementExt.boxSizing(submenu.node);

    // Get the bounding rect for the target item node.
    const itemRect = itemNode.getBoundingClientRect();

    // Compute the target X position.
    let x = itemRect.right - SUBMENU_OVERLAP;

    // Adjust the X position to fit on the screen.
    if (x + width > px + cw) {
      x = itemRect.left + SUBMENU_OVERLAP - width;
    }

    // Compute the target Y position.
    let y = itemRect.top - box.borderTop - box.paddingTop;

    // Adjust the Y position to fit on the screen.
    if (y + height > py + ch) {
      y = itemRect.bottom + box.borderBottom + box.paddingBottom - height;
    }

    // Update the position of the menu to the computed position.
    style.transform = `translate(${Math.max(0, x)}px, ${Math.max(0, y)}px`;

    // Finally, make the menu visible on the screen.
    style.opacity = '1';
  }

  /**
   * The results of a mnemonic search.
   */
  export interface IMnemonicResult {
    /**
     * The index of the first matching mnemonic item, or `-1`.
     */
    index: number;

    /**
     * Whether multiple mnemonic items matched.
     */
    multiple: boolean;

    /**
     * The index of the first auto matched non-mnemonic item.
     */
    auto: number;
  }

  /**
   * Find the best matching mnemonic item.
   *
   * The search starts at the given index and wraps around.
   */
  export function findMnemonic(
    items: ReadonlyArray<Menu.IItem>,
    key: string,
    start: number,
  ): IMnemonicResult {
    // Setup the result variables.
    let index = -1;
    let auto = -1;
    let multiple = false;

    // Normalize the key to upper case.
    const upperKey = key.toUpperCase();

    // Search the items from the given start index.
    for (let i = 0, n = items.length; i < n; ++i) {
      // Compute the wrapped index.
      const k = (i + start) % n;

      // Lookup the item
      const item = items[k];

      // Ignore items which cannot be activated.
      if (!canActivate(item)) {
        continue;
      }

      // Ignore items with an empty label.
      const { label } = item;
      if (label.length === 0) {
        continue;
      }

      // Lookup the mnemonic index for the label.
      const mn = item.mnemonic;

      // Handle a valid mnemonic index.
      if (mn >= 0 && mn < label.length) {
        if (label[mn].toUpperCase() === upperKey) {
          if (index === -1) {
            index = k;
          } else {
            multiple = true;
          }
        }
        continue;
      }

      // Finally, handle the auto index if possible.
      if (auto === -1 && label[0].toUpperCase() === upperKey) {
        auto = k;
      }
    }

    // Return the search results.
    return { index, multiple, auto };
  }

  /**
   * A concrete implementation of `Menu.IItem`.
   */
  class MenuItem implements Menu.IItem {
    /**
     * Construct a new menu item.
     */
    constructor(commands: CommandRegistry, options: Menu.IItemOptions) {
      this._commands = commands;
      this.type = options.type || 'command';
      this.command = options.command || '';
      this.args = options.args || Object.freeze({});
      this.submenu = options.submenu || null;
      this.tooltip = options.tooltip;
      this.customShortcut = options.customShortcut;
    }

    customShortcut?: string;

    tooltip?: string | ((props: { disabled?: boolean }) => string);

    iconClass: string;

    caption: string;

    mnemonic: number;

    icon: VirtualElement.IRenderer | undefined;

    /**
     * The type of the menu item.
     */
    readonly type: Menu.ItemType;

    /**
     * The command to execute when the item is triggered.
     */
    readonly command: string;

    /**
     * The arguments for the command.
     */
    readonly args: any;

    /**
     * The submenu for a `'submenu'` type item.
     */
    readonly submenu: Menu | null;

    /**
     * The display label for the menu item.
     */
    get label(): string {
      if (this.type === 'command') {
        return this._commands.getCommand(this.command)?.label || '';
      }
      if (this.type === 'submenu' && this.submenu) {
        return this.submenu.title.label;
      }
      return '';
    }

    /**
     * The icon label for the menu item.
     */
    get iconLabel(): any {
      if (this.type === 'command') {
        return this._commands.getCommand(this.command)?.icon || '';
      }
      if (this.type === 'submenu' && this.submenu) {
        return this.submenu.title.iconLabel;
      }
      return '';
    }

    /**
     * The extra class name for the menu item.
     */
    get className(): string {
      if (this.type === 'command') {
        return this.command;
      }
      if (this.type === 'submenu' && this.submenu) {
        return this.submenu.title.className;
      }
      return '';
    }

    /**
     * Whether the menu item is enabled.
     */
    get isEnabled(): boolean {
      if (this.type === 'command') {
        return this._commands.isEnabled(this.command, this.args);
      }
      if (this.type === 'submenu') {
        return this.submenu !== null;
      }
      return true;
    }

    /**
     * Whether the menu item is toggled.
     */
    get isToggled(): boolean {
      if (this.type === 'command') {
        return this._commands.isToggled(this.command, this.args);
      }
      return false;
    }

    /**
     * Whether the menu item is visible.
     */
    get isVisible(): boolean {
      if (this.type === 'command') {
        return this._commands.isVisible(this.command, this.args);
      }
      if (this.type === 'submenu') {
        return this.submenu !== null;
      }
      return true;
    }

    /**
     * The key binding for the menu item.
     */
    // TODO: from ShortcutService
    get keyBinding(): null {
      if (this.type === 'command') {
        // let { command, args } = this;
        // return (
        //   ArrayExt.findLastValue(
        //     this._commands.keyBindings,
        //     kb => kb.command === command && JSONExt.deepEqual(kb.args, args),
        //   ) || null
        // );
        return null;
      }
      return null;
    }

    private _commands: CommandRegistry;
  }
}
