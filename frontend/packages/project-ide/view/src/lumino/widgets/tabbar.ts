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
import {
  type ElementARIAAttrs,
  type ElementBaseAttrs,
  type ElementDataset,
  type ElementInlineStyle,
  h,
  VirtualDOM,
  type VirtualElement,
} from '../virtualdom';
import { type ISignal, Signal } from '../signaling';
import { type Message, MessageLoop } from '../messaging';
import { Drag } from '../dragdrop';
import { ElementExt } from '../domutils';
import { type IDisposable } from '../disposable';
import { ArrayExt } from '../algorithm';
import { Widget } from './widget';
import { Title } from './title';

const ARROW_KEYS = [
  'ArrowLeft',
  'ArrowUp',
  'ArrowRight',
  'ArrowDown',
  'Home',
  'End',
];

/**
 * A widget which displays titles as a single row or column of tabs.
 *
 * #### Notes
 * If CSS transforms are used to rotate nodes for vertically oriented
 * text, then tab dragging will not work correctly. The `tabsMovable`
 * property should be set to `false` when rotating nodes from CSS.
 */
export class TabBar<T> extends Widget {
  /**
   * Construct a new tab bar.
   *
   * @param options - The options for initializing the tab bar.
   */
  constructor(options: TabBar.IOptions<T> = {}) {
    super({ node: Private.createNode() });
    this.addClass('lm-TabBar');
    this.contentNode.setAttribute('role', 'tablist');
    this.setFlag(Widget.Flag.DisallowLayout);
    this._document = options.document || document;
    this.tabsMovable = options.tabsMovable || false;
    this.titlesEditable = options.titlesEditable || false;
    this.allowDeselect = options.allowDeselect || false;
    this.addButtonEnabled = options.addButtonEnabled || false;
    this.insertBehavior = options.insertBehavior || 'select-tab-if-needed';
    this.name = options.name || '';
    this.orientation = options.orientation || 'horizontal';
    this.removeBehavior = options.removeBehavior || 'select-tab-after';
    this.renderer = options.renderer || TabBar.defaultRenderer;
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this._releaseMouse();
    this._titles.length = 0;
    this._previousTitle = null;
    super.dispose();
  }

  /**
   * A signal emitted when the current tab is changed.
   *
   * #### Notes
   * This signal is emitted when the currently selected tab is changed
   * either through user or programmatic interaction.
   *
   * Notably, this signal is not emitted when the index of the current
   * tab changes due to tabs being inserted, removed, or moved. It is
   * only emitted when the actual current tab node is changed.
   */
  get currentChanged(): ISignal<this, TabBar.ICurrentChangedArgs<T>> {
    return this._currentChanged;
  }

  /**
   * A signal emitted when a tab is moved by the user.
   *
   * #### Notes
   * This signal is emitted when a tab is moved by user interaction.
   *
   * This signal is not emitted when a tab is moved programmatically.
   */
  get tabMoved(): ISignal<this, TabBar.ITabMovedArgs<T>> {
    return this._tabMoved;
  }

  /**
   * A signal emitted when a tab is clicked by the user.
   *
   * #### Notes
   * If the clicked tab is not the current tab, the clicked tab will be
   * made current and the `currentChanged` signal will be emitted first.
   *
   * This signal is emitted even if the clicked tab is the current tab.
   */
  get tabActivateRequested(): ISignal<
    this,
    TabBar.ITabActivateRequestedArgs<T>
  > {
    return this._tabActivateRequested;
  }

  /**
   * A signal emitted when the tab bar add button is clicked.
   */
  get addRequested(): ISignal<this, void> {
    return this._addRequested;
  }

  /**
   * A signal emitted when a tab close icon is clicked.
   *
   * #### Notes
   * This signal is not emitted unless the tab title is `closable`.
   */
  get tabCloseRequested(): ISignal<this, TabBar.ITabCloseRequestedArgs<T>> {
    return this._tabCloseRequested;
  }

  /**
   * A signal emitted when a tab is dragged beyond the detach threshold.
   *
   * #### Notes
   * This signal is emitted when the user drags a tab with the mouse,
   * and mouse is dragged beyond the detach threshold.
   *
   * The consumer of the signal should call `releaseMouse` and remove
   * the tab in order to complete the detach.
   *
   * This signal is only emitted once per drag cycle.
   */
  get tabDetachRequested(): ISignal<this, TabBar.ITabDetachRequestedArgs<T>> {
    return this._tabDetachRequested;
  }

  /**
   * The renderer used by the tab bar.
   */
  readonly renderer: TabBar.IRenderer<T>;

  /**
   * The document to use with the tab bar.
   *
   * The default is the global `document` instance.
   */
  get document(): Document | ShadowRoot {
    return this._document;
  }

  /**
   * Whether the tabs are movable by the user.
   *
   * #### Notes
   * Tabs can always be moved programmatically.
   */
  tabsMovable: boolean;

  /**
   * Whether the titles can be user-edited.
   *
   */
  get titlesEditable(): boolean {
    return this._titlesEditable;
  }

  /**
   * Set whether titles can be user edited.
   *
   */
  set titlesEditable(value: boolean) {
    this._titlesEditable = value;
  }

  /**
   * Whether a tab can be deselected by the user.
   *
   * #### Notes
   * Tabs can be always be deselected programmatically.
   */
  allowDeselect: boolean;

  /**
   * The selection behavior when inserting a tab.
   */
  insertBehavior: TabBar.InsertBehavior;

  /**
   * The selection behavior when removing a tab.
   */
  removeBehavior: TabBar.RemoveBehavior;

  /**
   * Get the currently selected title.
   *
   * #### Notes
   * This will be `null` if no tab is selected.
   */
  get currentTitle(): Title<T> | null {
    return this._titles[this._currentIndex] || null;
  }

  /**
   * Set the currently selected title.
   *
   * #### Notes
   * If the title does not exist, the title will be set to `null`.
   */
  set currentTitle(value: Title<T> | null) {
    this.currentIndex = value ? this._titles.indexOf(value) : -1;
  }

  /**
   * Get the index of the currently selected tab.
   *
   * #### Notes
   * This will be `-1` if no tab is selected.
   */
  get currentIndex(): number {
    return this._currentIndex;
  }

  /**
   * Set the index of the currently selected tab.
   *
   * #### Notes
   * If the value is out of range, the index will be set to `-1`.
   */
  set currentIndex(value: number) {
    // Adjust for an out of range index.
    if (value < 0 || value >= this._titles.length) {
      value = -1;
    }

    // Bail early if the index will not change.
    if (this._currentIndex === value) {
      return;
    }

    // Look up the previous index and title.
    const pi = this._currentIndex;
    const pt = this._titles[pi] || null;

    // Look up the current index and title.
    const ci = value;
    const ct = this._titles[ci] || null;

    // Update the current index and previous title.
    this._currentIndex = ci;
    this._previousTitle = pt;

    // Schedule an update of the tabs.
    this.update();

    // Emit the current changed signal.
    this._currentChanged.emit({
      previousIndex: pi,
      previousTitle: pt,
      currentIndex: ci,
      currentTitle: ct,
    });
  }

  /**
   * Get the name of the tab bar.
   */
  get name(): string {
    return this._name;
  }

  /**
   * Set the name of the tab bar.
   */
  set name(value: string) {
    this._name = value;
    if (value) {
      this.contentNode.setAttribute('aria-label', value);
    } else {
      this.contentNode.removeAttribute('aria-label');
    }
  }

  /**
   * Get the orientation of the tab bar.
   *
   * #### Notes
   * This controls whether the tabs are arranged in a row or column.
   */
  get orientation(): TabBar.Orientation {
    return this._orientation;
  }

  /**
   * Set the orientation of the tab bar.
   *
   * #### Notes
   * This controls whether the tabs are arranged in a row or column.
   */
  set orientation(value: TabBar.Orientation) {
    // Do nothing if the orientation does not change.
    if (this._orientation === value) {
      return;
    }

    // Release the mouse before making any changes.
    this._releaseMouse();

    // Toggle the orientation values.
    this._orientation = value;
    this.dataset.orientation = value;
    this.contentNode.setAttribute('aria-orientation', value);
  }

  /**
   * Whether the add button is enabled.
   */
  get addButtonEnabled(): boolean {
    return this._addButtonEnabled;
  }

  /**
   * Set whether the add button is enabled.
   */
  set addButtonEnabled(value: boolean) {
    // Do nothing if the value does not change.
    if (this._addButtonEnabled === value) {
      return;
    }

    this._addButtonEnabled = value;
    if (value) {
      this.addButtonNode.classList.remove('lm-mod-hidden');
    } else {
      this.addButtonNode.classList.add('lm-mod-hidden');
    }
  }

  /**
   * A read-only array of the titles in the tab bar.
   */
  get titles(): ReadonlyArray<Title<T>> {
    return this._titles;
  }

  /**
   * The tab bar content node.
   *
   * #### Notes
   * This is the node which holds the tab nodes.
   *
   * Modifying this node directly can lead to undefined behavior.
   */
  get contentNode(): HTMLUListElement {
    return this.node.getElementsByClassName(
      'lm-TabBar-content',
    )[0] as HTMLUListElement;
  }

  /**
   * The tab bar add button node.
   *
   * #### Notes
   * This is the node which holds the add button.
   *
   * Modifying this node directly can lead to undefined behavior.
   */
  get addButtonNode(): HTMLDivElement {
    return this.node.getElementsByClassName(
      'lm-TabBar-addButton',
    )[0] as HTMLDivElement;
  }

  /**
   * Add a tab to the end of the tab bar.
   *
   * @param value - The title which holds the data for the tab,
   *   or an options object to convert to a title.
   *
   * @returns The title object added to the tab bar.
   *
   * #### Notes
   * If the title is already added to the tab bar, it will be moved.
   */
  addTab(value: Title<T> | Title.IOptions<T>): Title<T> {
    return this.insertTab(this._titles.length, value);
  }

  /**
   * Insert a tab into the tab bar at the specified index.
   *
   * @param index - The index at which to insert the tab.
   *
   * @param value - The title which holds the data for the tab,
   *   or an options object to convert to a title.
   *
   * @returns The title object added to the tab bar.
   *
   * #### Notes
   * The index will be clamped to the bounds of the tabs.
   *
   * If the title is already added to the tab bar, it will be moved.
   */
  insertTab(index: number, value: Title<T> | Title.IOptions<T>): Title<T> {
    // Release the mouse before making any changes.
    this._releaseMouse();

    // Coerce the value to a title.
    const title = Private.asTitle(value);

    // Look up the index of the title.
    const i = this._titles.indexOf(title);

    // Clamp the insert index to the array bounds.
    let j = Math.max(0, Math.min(index, this._titles.length));

    // If the title is not in the array, insert it.
    if (i === -1) {
      // Insert the title into the array.
      ArrayExt.insert(this._titles, j, title);

      // Connect to the title changed signal.
      title.changed.connect(this._onTitleChanged, this);

      // Schedule an update of the tabs.
      this.update();

      // Adjust the current index for the insert.
      this._adjustCurrentForInsert(j, title);

      // Return the title added to the tab bar.
      return title;
    }

    // Otherwise, the title exists in the array and should be moved.

    // Adjust the index if the location is at the end of the array.
    if (j === this._titles.length) {
      j--;
    }

    // Bail if there is no effective move.
    if (i === j) {
      return title;
    }

    // Move the title to the new location.
    ArrayExt.move(this._titles, i, j);

    // Schedule an update of the tabs.
    this.update();

    // Adjust the current index for the move.
    this._adjustCurrentForMove(i, j);

    // Return the title added to the tab bar.
    return title;
  }

  /**
   * Remove a tab from the tab bar.
   *
   * @param title - The title for the tab to remove.
   *
   * #### Notes
   * This is a no-op if the title is not in the tab bar.
   */
  removeTab(title: Title<T>): void {
    this.removeTabAt(this._titles.indexOf(title));
  }

  /**
   * Remove the tab at a given index from the tab bar.
   *
   * @param index - The index of the tab to remove.
   *
   * #### Notes
   * This is a no-op if the index is out of range.
   */
  removeTabAt(index: number): void {
    // Release the mouse before making any changes.
    this._releaseMouse();

    // Remove the title from the array.
    const title = ArrayExt.removeAt(this._titles, index);

    // Bail if the index is out of range.
    if (!title) {
      return;
    }

    // Disconnect from the title changed signal.
    title.changed.disconnect(this._onTitleChanged, this);

    // Clear the previous title if it's being removed.
    if (title === this._previousTitle) {
      this._previousTitle = null;
    }

    // Schedule an update of the tabs.
    this.update();

    // Adjust the current index for the remove.
    this._adjustCurrentForRemove(index, title);
  }

  /**
   * Remove all tabs from the tab bar.
   */
  clearTabs(): void {
    // Bail if there is nothing to remove.
    if (this._titles.length === 0) {
      return;
    }

    // Release the mouse before making any changes.
    this._releaseMouse();

    // Disconnect from the title changed signals.
    for (const title of this._titles) {
      title.changed.disconnect(this._onTitleChanged, this);
    }

    // Get the current index and title.
    const pi = this.currentIndex;
    const pt = this.currentTitle;

    // Reset the current index and previous title.
    this._currentIndex = -1;
    this._previousTitle = null;

    // Clear the title array.
    this._titles.length = 0;

    // Schedule an update of the tabs.
    this.update();

    // If no tab was selected, there's nothing else to do.
    if (pi === -1) {
      return;
    }

    // Emit the current changed signal.
    this._currentChanged.emit({
      previousIndex: pi,
      previousTitle: pt,
      currentIndex: -1,
      currentTitle: null,
    });
  }

  /**
   * Release the mouse and restore the non-dragged tab positions.
   *
   * #### Notes
   * This will cause the tab bar to stop handling mouse events and to
   * restore the tabs to their non-dragged positions.
   */
  releaseMouse(): void {
    this._releaseMouse();
  }

  /**
   * Handle the DOM events for the tab bar.
   *
   * @param event - The DOM event sent to the tab bar.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the tab bar's DOM node.
   *
   * This should not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'pointerdown':
        this._evtPointerDown(event as PointerEvent);
        break;
      case 'pointermove':
        this._evtPointerMove(event as PointerEvent);
        break;
      case 'pointerup':
        this._evtPointerUp(event as PointerEvent);
        break;
      case 'dblclick':
        this._evtDblClick(event as MouseEvent);
        break;
      case 'keydown':
        event.eventPhase === Event.CAPTURING_PHASE
          ? this._evtKeyDownCapturing(event as KeyboardEvent)
          : this._evtKeyDown(event as KeyboardEvent);
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
    this.node.addEventListener('pointerdown', this);
    this.node.addEventListener('dblclick', this);
    this.node.addEventListener('keydown', this);
  }

  /**
   * A message handler invoked on an `'after-detach'` message.
   */
  protected onAfterDetach(msg: Message): void {
    this.node.removeEventListener('pointerdown', this);
    this.node.removeEventListener('dblclick', this);
    this.node.removeEventListener('keydown', this);
    this._releaseMouse();
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    const titles = this._titles;
    const { renderer } = this;
    const { currentTitle } = this;
    const content = new Array<VirtualElement>(titles.length);
    // Keep the tabindex="0" attribute to the tab which handled it before the update.
    // If the add button handles it, no need to do anything. If no element of the tab
    // bar handles it, set it on the current or the first tab to ensure one element
    // handles it after update.
    const tabHandlingTabindex =
      this._getCurrentTabindex() ??
      (this._currentIndex > -1 ? this._currentIndex : 0);

    for (let i = 0, n = titles.length; i < n; ++i) {
      const title = titles[i];
      const current = title === currentTitle;
      const zIndex = current ? n : n - i - 1;
      const tabIndex = tabHandlingTabindex === i ? 0 : -1;
      content[i] = renderer.renderTab({ title, current, zIndex, tabIndex });
    }
    VirtualDOM.render(content, this.contentNode);
  }

  /**
   * Get the index of the tab which handles tabindex="0".
   * If the add button handles tabindex="0", -1 is returned.
   * If none of the previous handles tabindex="0", null is returned.
   */
  private _getCurrentTabindex(): number | null {
    let index: number | null = null;
    const elemTabindex = this.contentNode.querySelector('li[tabindex="0"]');
    if (elemTabindex) {
      index = [...this.contentNode.children].indexOf(elemTabindex);
    } else if (
      this._addButtonEnabled &&
      this.addButtonNode.getAttribute('tabindex') === '0'
    ) {
      index = -1;
    }
    return index;
  }

  /**
   * Handle the `'dblclick'` event for the tab bar.
   */
  private _evtDblClick(event: MouseEvent): void {
    // Do nothing if titles are not editable
    if (!this.titlesEditable) {
      return;
    }

    const tabs = this.contentNode.children;

    // Find the index of the targeted tab.
    const index = ArrayExt.findFirstIndex(tabs, tab =>
      ElementExt.hitTest(tab, event.clientX, event.clientY),
    );

    // Do nothing if the press is not on a tab.
    if (index === -1) {
      return;
    }

    const title = this.titles[index];
    const label = tabs[index].querySelector(
      '.lm-TabBar-tabLabel',
    ) as HTMLElement;
    if (label && label.contains(event.target as HTMLElement)) {
      const value = title.label || '';

      // Clear the label element
      const oldValue = label.innerHTML;
      label.innerHTML = '';

      const input = document.createElement('input');
      input.classList.add('lm-TabBar-tabInput');
      input.value = value;
      label.appendChild(input);

      const onblur = () => {
        input.removeEventListener('blur', onblur);
        label.innerHTML = oldValue;
        this.node.addEventListener('keydown', this);
      };

      input.addEventListener('dblclick', (event: Event) =>
        event.stopPropagation(),
      );
      input.addEventListener('blur', onblur);
      input.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          if (input.value !== '') {
            title.label = title.caption = input.value;
          }
          onblur();
        } else if (event.key === 'Escape') {
          onblur();
        }
      });
      this.node.removeEventListener('keydown', this);
      input.select();
      input.focus();

      if (label.children.length > 0) {
        (label.children[0] as HTMLElement).focus();
      }
    }
  }

  /**
   * Handle the `'keydown'` event for the tab bar at capturing phase.
   */
  private _evtKeyDownCapturing(event: KeyboardEvent): void {
    if (event.eventPhase !== Event.CAPTURING_PHASE) {
      return;
    }

    // Stop all input events during drag.
    event.preventDefault();
    event.stopPropagation();

    // Release the mouse if `Escape` is pressed.
    if (event.key === 'Escape') {
      this._releaseMouse();
    }
  }

  /**
   * Handle the `'keydown'` event for the tab bar at target phase.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    // Allow for navigation using tab key
    if (event.key === 'Tab' || event.eventPhase === Event.CAPTURING_PHASE) {
      return;
    }

    // Check if Enter or Spacebar key has been pressed and open that tab
    if (
      event.key === 'Enter' ||
      event.key === 'Spacebar' ||
      event.key === ' '
    ) {
      // Get focus element that is in focus by the tab key
      const focusedElement = document.activeElement;

      // Test first if the focus is on the add button node
      if (
        this.addButtonEnabled &&
        this.addButtonNode.contains(focusedElement)
      ) {
        event.preventDefault();
        event.stopPropagation();
        this._addRequested.emit();
      } else {
        const index = ArrayExt.findFirstIndex(this.contentNode.children, tab =>
          tab.contains(focusedElement),
        );
        if (index >= 0) {
          event.preventDefault();
          event.stopPropagation();
          this.currentIndex = index;
        }
      }
      // Handle the arrow keys to switch tabs.
    } else if (ARROW_KEYS.includes(event.key)) {
      // Create a list of all focusable elements in the tab bar.
      const focusable: Element[] = [...this.contentNode.children];
      if (this.addButtonEnabled) {
        focusable.push(this.addButtonNode);
      }
      // If the tab bar contains only one element, nothing to do.
      if (focusable.length <= 1) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      // Get the current focused element.
      let focusedIndex = focusable.indexOf(document.activeElement as Element);
      if (focusedIndex === -1) {
        focusedIndex = this._currentIndex;
      }

      // Find the next element to focus on.
      let nextFocused: Element | null | undefined;
      if (
        (event.key === 'ArrowRight' && this._orientation === 'horizontal') ||
        (event.key === 'ArrowDown' && this._orientation === 'vertical')
      ) {
        nextFocused = focusable[focusedIndex + 1] ?? focusable[0];
      } else if (
        (event.key === 'ArrowLeft' && this._orientation === 'horizontal') ||
        (event.key === 'ArrowUp' && this._orientation === 'vertical')
      ) {
        nextFocused =
          focusable[focusedIndex - 1] ?? focusable[focusable.length - 1];
      } else if (event.key === 'Home') {
        nextFocused = focusable[0];
      } else if (event.key === 'End') {
        nextFocused = focusable[focusable.length - 1];
      }

      // Change the focused element and the tabindex value.
      if (nextFocused) {
        focusable[focusedIndex]?.setAttribute('tabindex', '-1');
        nextFocused?.setAttribute('tabindex', '0');
        (nextFocused as HTMLElement).focus();
      }
    }
  }

  /**
   * Handle the `'pointerdown'` event for the tab bar.
   */
  private _evtPointerDown(event: PointerEvent | MouseEvent): void {
    // Do nothing if it's not a left or middle mouse press.
    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    // Do nothing if a drag is in progress.
    if (this._dragData) {
      return;
    }

    // Do nothing if a title editable input was clicked.
    if (
      (event.target as HTMLElement).classList.contains('lm-TabBar-tabInput')
    ) {
      return;
    }

    // Check if the add button was clicked.
    const addButtonClicked =
      this.addButtonEnabled &&
      this.addButtonNode.contains(event.target as HTMLElement);

    // Lookup the tab nodes.
    const tabs = this.contentNode.children;

    // Find the index of the pressed tab.
    const index = ArrayExt.findFirstIndex(tabs, tab =>
      ElementExt.hitTest(tab, event.clientX, event.clientY),
    );

    // Do nothing if the press is not on a tab or the add button.
    if (index === -1 && !addButtonClicked) {
      return;
    }

    // Pressing on a tab stops the event propagation.
    // event.preventDefault();
    // event.stopPropagation();

    // Initialize the non-measured parts of the drag data.
    this._dragData = {
      tab: tabs[index] as HTMLElement,
      index,
      pressX: event.clientX,
      pressY: event.clientY,
      tabPos: -1,
      tabSize: -1,
      tabPressPos: -1,
      targetIndex: -1,
      tabLayout: null,
      contentRect: null,
      override: null,
      dragActive: false,
      dragAborted: false,
      detachRequested: false,
    };

    // Add the document pointer up listener.
    this.document.addEventListener('pointerup', this, true);

    // Do nothing else if the middle button or add button is clicked.
    if (event.button === 1 || addButtonClicked) {
      return;
    }

    // Do nothing else if the close icon is clicked.
    const icon = tabs[index].querySelector(this.renderer.closeIconSelector);
    if (icon && icon.contains(event.target as HTMLElement)) {
      return;
    }

    // Add the extra listeners if the tabs are movable.
    if (this.tabsMovable) {
      this.document.addEventListener('pointermove', this, true);
      this.document.addEventListener('keydown', this, true);
      this.document.addEventListener('contextmenu', this, true);
    }

    // Update the current index as appropriate.
    if (this.allowDeselect && this.currentIndex === index) {
      this.currentIndex = -1;
    } else {
      this.currentIndex = index;
    }

    // Do nothing else if there is no current tab.
    if (this.currentIndex === -1) {
      return;
    }

    // Emit the tab activate request signal.
    this._tabActivateRequested.emit({
      index: this.currentIndex,
      title: this.currentTitle!,
    });
  }

  /**
   * Handle the `'pointermove'` event for the tab bar.
   */
  private _evtPointerMove(event: PointerEvent | MouseEvent): void {
    // Do nothing if no drag is in progress.
    const data = this._dragData;
    if (!data) {
      return;
    }

    // Suppress the event during a drag.
    event.preventDefault();
    event.stopPropagation();

    // Lookup the tab nodes.
    const tabs = this.contentNode.children;

    // Bail early if the drag threshold has not been met.
    if (!data.dragActive && !Private.dragExceeded(data, event)) {
      return;
    }

    // Activate the drag if necessary.
    if (!data.dragActive) {
      // Fill in the rest of the drag data measurements.
      const tabRect = data.tab.getBoundingClientRect();
      if (this._orientation === 'horizontal') {
        data.tabPos = data.tab.offsetLeft;
        data.tabSize = tabRect.width;
        data.tabPressPos = data.pressX - tabRect.left;
      } else {
        data.tabPos = data.tab.offsetTop;
        data.tabSize = tabRect.height;
        data.tabPressPos = data.pressY - tabRect.top;
      }
      data.tabPressOffset = {
        x: data.pressX - tabRect.left,
        y: data.pressY - tabRect.top,
      };
      data.tabLayout = Private.snapTabLayout(tabs, this._orientation);
      data.contentRect = this.contentNode.getBoundingClientRect();
      data.override = Drag.overrideCursor('default');

      // Add the dragging style classes.
      data.tab.classList.add('lm-mod-dragging');
      this.addClass('lm-mod-dragging');

      // Mark the drag as active.
      data.dragActive = true;
    }

    // Emit the detach requested signal if the threshold is exceeded.
    if (!data.detachRequested && Private.detachExceeded(data, event)) {
      // Only emit the signal once per drag cycle.
      data.detachRequested = true;

      // Setup the arguments for the signal.
      const { index } = data;
      const { clientX } = event;
      const { clientY } = event;
      const tab = tabs[index] as HTMLElement;
      const title = this._titles[index];

      // Emit the tab detach requested signal.
      this._tabDetachRequested.emit({
        index,
        title,
        tab,
        clientX,
        clientY,
        offset: data.tabPressOffset,
      });

      // Bail if the signal handler aborted the drag.
      if (data.dragAborted) {
        return;
      }
    }

    // Update the positions of the tabs.
    Private.layoutTabs(tabs, data, event, this._orientation);
  }

  /**
   * Handle the `'pointerup'` event for the document.
   */
  private _evtPointerUp(event: PointerEvent | MouseEvent): void {
    // Do nothing if it's not a left or middle mouse release.
    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    // Do nothing if no drag is in progress.
    const data = this._dragData;
    if (!data) {
      return;
    }

    // Stop the event propagation.
    event.preventDefault();
    event.stopPropagation();

    // Remove the extra mouse event listeners.
    this.document.removeEventListener('pointermove', this, true);
    this.document.removeEventListener('pointerup', this, true);
    this.document.removeEventListener('keydown', this, true);
    this.document.removeEventListener('contextmenu', this, true);

    // Handle a release when the drag is not active.
    if (!data.dragActive) {
      // Clear the drag data.
      this._dragData = null;

      // Handle clicking the add button.
      const addButtonClicked =
        this.addButtonEnabled &&
        this.addButtonNode.contains(event.target as HTMLElement);
      if (addButtonClicked) {
        this._addRequested.emit(undefined);
        return;
      }

      // Lookup the tab nodes.
      const tabs = this.contentNode.children;

      // Find the index of the released tab.
      const index = ArrayExt.findFirstIndex(tabs, tab =>
        ElementExt.hitTest(tab, event.clientX, event.clientY),
      );

      // Do nothing if the release is not on the original pressed tab.
      if (index !== data.index) {
        return;
      }

      // Ignore the release if the title is not closable.
      const title = this._titles[index];
      if (!title.closable) {
        return;
      }

      // Emit the close requested signal if the middle button is released.
      if (event.button === 1) {
        this._tabCloseRequested.emit({ index, title });
        return;
      }

      // Emit the close requested signal if the close icon was released.
      const icon = tabs[index].querySelector(this.renderer.closeIconSelector);
      if (icon && icon.contains(event.target as HTMLElement)) {
        this._tabCloseRequested.emit({ index, title });
        return;
      }

      // Otherwise, there is nothing left to do.
      return;
    }

    // Do nothing if the left button is not released.
    if (event.button !== 0) {
      return;
    }

    // Position the tab at its final resting position.
    Private.finalizeTabPosition(data, this._orientation);

    // Remove the dragging class from the tab so it can be transitioned.
    data.tab.classList.remove('lm-mod-dragging');

    // Parse the transition duration for releasing the tab.
    const duration = Private.parseTransitionDuration(data.tab);

    // Complete the release on a timer to allow the tab to transition.
    setTimeout(() => {
      // Do nothing if the drag has been aborted.
      if (data.dragAborted) {
        return;
      }

      // Clear the drag data reference.
      this._dragData = null;

      // Reset the positions of the tabs.
      Private.resetTabPositions(this.contentNode.children, this._orientation);

      // Clear the cursor grab.
      data.override!.dispose();

      // Remove the remaining dragging style.
      this.removeClass('lm-mod-dragging');

      // If the tab was not moved, there is nothing else to do.
      const i = data.index;
      const j = data.targetIndex;
      if (j === -1 || i === j) {
        return;
      }

      // Move the title to the new locations.
      ArrayExt.move(this._titles, i, j);

      // Adjust the current index for the move.
      this._adjustCurrentForMove(i, j);

      // Emit the tab moved signal.
      this._tabMoved.emit({
        fromIndex: i,
        toIndex: j,
        title: this._titles[j],
      });

      // Update the tabs immediately to prevent flicker.
      MessageLoop.sendMessage(this, Widget.Msg.UpdateRequest);
    }, duration);
  }

  /**
   * Release the mouse and restore the non-dragged tab positions.
   */
  private _releaseMouse(): void {
    // Do nothing if no drag is in progress.
    const data = this._dragData;
    if (!data) {
      return;
    }

    // Clear the drag data reference.
    this._dragData = null;

    // Remove the extra document event listeners.
    this.document.removeEventListener('pointermove', this, true);
    this.document.removeEventListener('pointerup', this, true);
    this.document.removeEventListener('keydown', this, true);
    this.document.removeEventListener('contextmenu', this, true);

    // Indicate the drag has been aborted. This allows the mouse
    // event handlers to return early when the drag is canceled.
    data.dragAborted = true;

    // If the drag is not active, there's nothing more to do.
    if (!data.dragActive) {
      return;
    }

    // Reset the tabs to their non-dragged positions.
    Private.resetTabPositions(this.contentNode.children, this._orientation);

    // Clear the cursor override.
    data.override!.dispose();

    // Clear the dragging style classes.
    data.tab.classList.remove('lm-mod-dragging');
    this.removeClass('lm-mod-dragging');
  }

  /**
   * Adjust the current index for a tab insert operation.
   *
   * This method accounts for the tab bar's insertion behavior when
   * adjusting the current index and emitting the changed signal.
   */
  private _adjustCurrentForInsert(i: number, title: Title<T>): void {
    // Lookup commonly used variables.
    const ct = this.currentTitle;
    const ci = this._currentIndex;
    const bh = this.insertBehavior;

    // TODO: do we need to do an update to update the aria-selected attribute?

    // Handle the behavior where the new tab is always selected,
    // or the behavior where the new tab is selected if needed.
    if (bh === 'select-tab' || (bh === 'select-tab-if-needed' && ci === -1)) {
      this._currentIndex = i;
      this._previousTitle = ct;
      this._currentChanged.emit({
        previousIndex: ci,
        previousTitle: ct,
        currentIndex: i,
        currentTitle: title,
      });
      return;
    }

    // Otherwise, silently adjust the current index if needed.
    if (ci >= i) {
      this._currentIndex++;
    }
  }

  /**
   * Adjust the current index for a tab move operation.
   *
   * This method will not cause the actual current tab to change.
   * It silently adjusts the index to account for the given move.
   */
  private _adjustCurrentForMove(i: number, j: number): void {
    if (this._currentIndex === i) {
      this._currentIndex = j;
    } else if (this._currentIndex < i && this._currentIndex >= j) {
      this._currentIndex++;
    } else if (this._currentIndex > i && this._currentIndex <= j) {
      this._currentIndex--;
    }
  }

  /**
   * Adjust the current index for a tab remove operation.
   *
   * This method accounts for the tab bar's remove behavior when
   * adjusting the current index and emitting the changed signal.
   */
  private _adjustCurrentForRemove(i: number, title: Title<T>): void {
    // Lookup commonly used variables.
    const ci = this._currentIndex;
    const bh = this.removeBehavior;

    // Silently adjust the index if the current tab is not removed.
    if (ci !== i) {
      if (ci > i) {
        this._currentIndex--;
      }
      return;
    }

    // TODO: do we need to do an update to adjust the aria-selected value?

    // No tab gets selected if the tab bar is empty.
    if (this._titles.length === 0) {
      this._currentIndex = -1;
      this._currentChanged.emit({
        previousIndex: i,
        previousTitle: title,
        currentIndex: -1,
        currentTitle: null,
      });
      return;
    }

    // Handle behavior where the next sibling tab is selected.
    if (bh === 'select-tab-after') {
      this._currentIndex = Math.min(i, this._titles.length - 1);
      this._currentChanged.emit({
        previousIndex: i,
        previousTitle: title,
        currentIndex: this._currentIndex,
        currentTitle: this.currentTitle,
      });
      return;
    }

    // Handle behavior where the previous sibling tab is selected.
    if (bh === 'select-tab-before') {
      this._currentIndex = Math.max(0, i - 1);
      this._currentChanged.emit({
        previousIndex: i,
        previousTitle: title,
        currentIndex: this._currentIndex,
        currentTitle: this.currentTitle,
      });
      return;
    }

    // Handle behavior where the previous history tab is selected.
    if (bh === 'select-previous-tab') {
      if (this._previousTitle) {
        this._currentIndex = this._titles.indexOf(this._previousTitle);
        this._previousTitle = null;
      } else {
        this._currentIndex = Math.min(i, this._titles.length - 1);
      }
      this._currentChanged.emit({
        previousIndex: i,
        previousTitle: title,
        currentIndex: this._currentIndex,
        currentTitle: this.currentTitle,
      });
      return;
    }

    // Otherwise, no tab gets selected.
    this._currentIndex = -1;
    this._currentChanged.emit({
      previousIndex: i,
      previousTitle: title,
      currentIndex: -1,
      currentTitle: null,
    });
  }

  /**
   * Handle the `changed` signal of a title object.
   */
  private _onTitleChanged(sender: Title<T>): void {
    this.update();
  }

  private _name: string;

  private _currentIndex = -1;

  private _titles: Title<T>[] = [];

  private _orientation: TabBar.Orientation;

  private _document: Document | ShadowRoot;

  private _titlesEditable = false;

  private _previousTitle: Title<T> | null = null;

  private _dragData: Private.IDragData | null = null;

  private _addButtonEnabled = false;

  private _tabMoved = new Signal<this, TabBar.ITabMovedArgs<T>>(this);

  private _currentChanged = new Signal<this, TabBar.ICurrentChangedArgs<T>>(
    this,
  );

  private _addRequested = new Signal<this, void>(this);

  private _tabCloseRequested = new Signal<
    this,
    TabBar.ITabCloseRequestedArgs<T>
  >(this);

  private _tabDetachRequested = new Signal<
    this,
    TabBar.ITabDetachRequestedArgs<T>
  >(this);

  private _tabActivateRequested = new Signal<
    this,
    TabBar.ITabActivateRequestedArgs<T>
  >(this);
}

/**
 * The namespace for the `TabBar` class statics.
 */
export namespace TabBar {
  /**
   * A type alias for a tab bar orientation.
   */
  export type Orientation =
    | /**
     * The tabs are arranged in a single row, left-to-right.
     *
     * The tab text orientation is horizontal.
     */
    'horizontal'

    /**
     * The tabs are arranged in a single column, top-to-bottom.
     *
     * The tab text orientation is horizontal.
     */
    | 'vertical';

  /**
   * A type alias for the selection behavior on tab insert.
   */
  export type InsertBehavior =
    | /**
     * The selected tab will not be changed.
     */
    'none'

    /**
     * The inserted tab will be selected.
     */
    | 'select-tab'

    /**
     * The inserted tab will be selected if the current tab is null.
     */
    | 'select-tab-if-needed';

  /**
   * A type alias for the selection behavior on tab remove.
   */
  export type RemoveBehavior =
    | /**
     * No tab will be selected.
     */
    'none'

    /**
     * The tab after the removed tab will be selected if possible.
     */
    | 'select-tab-after'

    /**
     * The tab before the removed tab will be selected if possible.
     */
    | 'select-tab-before'

    /**
     * The previously selected tab will be selected if possible.
     */
    | 'select-previous-tab';

  /**
   * An options object for creating a tab bar.
   */
  export interface IOptions<T> {
    /**
     * The document to use with the tab bar.
     *
     * The default is the global `document` instance.
     */

    document?: Document | ShadowRoot;

    /**
     * Name of the tab bar.
     *
     * This is used for accessibility reasons. The default is the empty string.
     */
    name?: string;

    /**
     * The layout orientation of the tab bar.
     *
     * The default is `horizontal`.
     */
    orientation?: TabBar.Orientation;

    /**
     * Whether the tabs are movable by the user.
     *
     * The default is `false`.
     */
    tabsMovable?: boolean;

    /**
     * Whether a tab can be deselected by the user.
     *
     * The default is `false`.
     */
    allowDeselect?: boolean;

    /**
     * Whether the titles can be directly edited by the user.
     *
     * The default is `false`.
     */
    titlesEditable?: boolean;

    /**
     * Whether the add button is enabled.
     *
     * The default is `false`.
     */
    addButtonEnabled?: boolean;

    /**
     * The selection behavior when inserting a tab.
     *
     * The default is `'select-tab-if-needed'`.
     */
    insertBehavior?: TabBar.InsertBehavior;

    /**
     * The selection behavior when removing a tab.
     *
     * The default is `'select-tab-after'`.
     */
    removeBehavior?: TabBar.RemoveBehavior;

    /**
     * A renderer to use with the tab bar.
     *
     * The default is a shared renderer instance.
     */
    renderer?: IRenderer<T>;
  }

  /**
   * The arguments object for the `currentChanged` signal.
   */
  export interface ICurrentChangedArgs<T> {
    /**
     * The previously selected index.
     */
    readonly previousIndex: number;

    /**
     * The previously selected title.
     */
    readonly previousTitle: Title<T> | null;

    /**
     * The currently selected index.
     */
    readonly currentIndex: number;

    /**
     * The currently selected title.
     */
    readonly currentTitle: Title<T> | null;
  }

  /**
   * The arguments object for the `tabMoved` signal.
   */
  export interface ITabMovedArgs<T> {
    /**
     * The previous index of the tab.
     */
    readonly fromIndex: number;

    /**
     * The current index of the tab.
     */
    readonly toIndex: number;

    /**
     * The title for the tab.
     */
    readonly title: Title<T>;
  }

  /**
   * The arguments object for the `tabActivateRequested` signal.
   */
  export interface ITabActivateRequestedArgs<T> {
    /**
     * The index of the tab to activate.
     */
    readonly index: number;

    /**
     * The title for the tab.
     */
    readonly title: Title<T>;
  }

  /**
   * The arguments object for the `tabCloseRequested` signal.
   */
  export interface ITabCloseRequestedArgs<T> {
    /**
     * The index of the tab to close.
     */
    readonly index: number;

    /**
     * The title for the tab.
     */
    readonly title: Title<T>;
  }

  /**
   * The arguments object for the `tabDetachRequested` signal.
   */
  export interface ITabDetachRequestedArgs<T> {
    /**
     * The index of the tab to detach.
     */
    readonly index: number;

    /**
     * The title for the tab.
     */
    readonly title: Title<T>;

    /**
     * The node representing the tab.
     */
    readonly tab: HTMLElement;

    /**
     * The current client X position of the mouse.
     */
    readonly clientX: number;

    /**
     * The current client Y position of the mouse.
     */
    readonly clientY: number;

    /**
     * The mouse position in the tab coordinate.
     */
    readonly offset?: { x: number; y: number };
  }

  /**
   * An object which holds the data to render a tab.
   */
  export interface IRenderData<T> {
    /**
     * The title associated with the tab.
     */
    readonly title: Title<T>;

    /**
     * Whether the tab is the current tab.
     */
    readonly current: boolean;

    /**
     * The z-index for the tab.
     */
    readonly zIndex: number;

    /**
     * The tabindex value for the tab.
     */
    readonly tabIndex?: number;
  }

  /**
   * A renderer for use with a tab bar.
   */
  export interface IRenderer<T> {
    /**
     * A selector which matches the close icon node in a tab.
     */
    readonly closeIconSelector: string;

    /**
     * Render the virtual element for a tab.
     *
     * @param data - The data to use for rendering the tab.
     *
     * @returns A virtual element representing the tab.
     */
    renderTab(data: IRenderData<T>): VirtualElement;
  }

  /**
   * The default implementation of `IRenderer`.
   *
   * #### Notes
   * Subclasses are free to reimplement rendering methods as needed.
   */
  export class Renderer implements IRenderer<any> {
    constructor() {
      this._uuid = ++Renderer._nInstance;
    }

    /**
     * A selector which matches the close icon node in a tab.
     */
    readonly closeIconSelector = '.lm-TabBar-tabCloseIcon';

    /**
     * Render the virtual element for a tab.
     *
     * @param data - The data to use for rendering the tab.
     *
     * @returns A virtual element representing the tab.
     */
    renderTab(data: IRenderData<any>): VirtualElement {
      const title = data.title.caption;
      const key = this.createTabKey(data);
      const id = key;
      const style = this.createTabStyle(data);
      const className = this.createTabClass(data);
      const dataset = this.createTabDataset(data);
      const aria = this.createTabARIA(data);
      if (data.title.closable) {
        return h.li(
          { id, key, className, title, style, dataset, ...aria },
          this.renderIcon(data) as any,
          this.renderLabel(data),
          this.renderCloseIcon(data),
        );
      } else {
        return h.li(
          { id, key, className, title, style, dataset, ...aria },
          this.renderIcon(data) as any,
          this.renderLabel(data),
        );
      }
    }

    /**
     * Render the icon element for a tab.
     *
     * @param data - The data to use for rendering the tab.
     *
     * @returns A virtual element representing the tab icon.
     */
    renderIcon(data: IRenderData<any>): VirtualElement {
      const { title } = data;
      const className = this.createIconClass(data);

      // If title.icon is undefined, it will be ignored.
      return h.div({ className }, title.icon!, title.iconLabel);
    }

    /**
     * Render the label element for a tab.
     *
     * @param data - The data to use for rendering the tab.
     *
     * @returns A virtual element representing the tab label.
     */
    renderLabel(data: IRenderData<any>): VirtualElement {
      return h.div({ className: 'lm-TabBar-tabLabel' }, data.title.label);
    }

    /**
     * Render the close icon element for a tab.
     *
     * @param data - The data to use for rendering the tab.
     *
     * @returns A virtual element representing the tab close icon.
     */
    renderCloseIcon(data: IRenderData<any>): VirtualElement {
      return h.div({ className: 'lm-TabBar-tabCloseIcon' });
    }

    /**
     * Create a unique render key for the tab.
     *
     * @param data - The data to use for the tab.
     *
     * @returns The unique render key for the tab.
     *
     * #### Notes
     * This method caches the key against the tab title the first time
     * the key is generated. This enables efficient rendering of moved
     * tabs and avoids subtle hover style artifacts.
     */
    createTabKey(data: IRenderData<any>): string {
      let key = this._tabKeys.get(data.title);
      if (key === undefined) {
        key = `tab-key-${this._uuid}-${this._tabID++}`;
        this._tabKeys.set(data.title, key);
      }
      return key;
    }

    /**
     * Create the inline style object for a tab.
     *
     * @param data - The data to use for the tab.
     *
     * @returns The inline style data for the tab.
     */
    createTabStyle(data: IRenderData<any>): ElementInlineStyle {
      return { zIndex: `${data.zIndex}` };
    }

    /**
     * Create the class name for the tab.
     *
     * @param data - The data to use for the tab.
     *
     * @returns The full class name for the tab.
     */
    createTabClass(data: IRenderData<any>): string {
      let name = 'lm-TabBar-tab';
      if (data.title.className) {
        name += ` ${data.title.className}`;
      }
      if (data.title.closable) {
        name += ' lm-mod-closable';
      }
      if (data.current) {
        name += ' lm-mod-current';
      }
      return name;
    }

    /**
     * Create the dataset for a tab.
     *
     * @param data - The data to use for the tab.
     *
     * @returns The dataset for the tab.
     */
    createTabDataset(data: IRenderData<any>): ElementDataset {
      return data.title.dataset;
    }

    /**
     * Create the ARIA attributes for a tab.
     *
     * @param data - The data to use for the tab.
     *
     * @returns The ARIA attributes for the tab.
     */
    createTabARIA(data: IRenderData<any>): ElementARIAAttrs | ElementBaseAttrs {
      return {
        role: 'tab',
        'aria-selected': data.current.toString(),
        tabindex: `${data.tabIndex ?? '-1'}`,
      };
    }

    /**
     * Create the class name for the tab icon.
     *
     * @param data - The data to use for the tab.
     *
     * @returns The full class name for the tab icon.
     */
    createIconClass(data: IRenderData<any>): string {
      const name = 'lm-TabBar-tabIcon';
      const extra = data.title.iconClass;
      return extra ? `${name} ${extra}` : name;
    }

    private static _nInstance = 0;

    private readonly _uuid: number;

    private _tabID = 0;

    private _tabKeys = new WeakMap<Title<any>, string>();
  }

  /**
   * The default `Renderer` instance.
   */
  export const defaultRenderer = new Renderer();

  /**
   * A selector which matches the add button node in the tab bar.
   */
  export const addButtonSelector = '.lm-TabBar-addButton';
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * The start drag distance threshold.
   */
  export const DRAG_THRESHOLD = 5;

  /**
   * The detach distance threshold.
   */
  export const DETACH_THRESHOLD = 20;

  /**
   * A struct which holds the drag data for a tab bar.
   */
  export interface IDragData {
    /**
     * The tab node being dragged.
     */
    tab: HTMLElement;

    /**
     * The index of the tab being dragged.
     */
    index: number;

    /**
     * The mouse press client X position.
     */
    pressX: number;

    /**
     * The mouse press client Y position.
     */
    pressY: number;

    /**
     * The offset left/top of the tab being dragged.
     *
     * This will be `-1` if the drag is not active.
     */
    tabPos: number;

    /**
     * The offset width/height of the tab being dragged.
     *
     * This will be `-1` if the drag is not active.
     */
    tabSize: number;

    /**
     * The original mouse X/Y position in tab coordinates.
     *
     * This will be `-1` if the drag is not active.
     */
    tabPressPos: number;

    /**
     * The original mouse position in tab coordinates.
     *
     * This is undefined if the drag is not active.
     */
    tabPressOffset?: { x: number; y: number };

    /**
     * The tab target index upon mouse release.
     *
     * This will be `-1` if the drag is not active.
     */
    targetIndex: number;

    /**
     * The array of tab layout objects snapped at drag start.
     *
     * This will be `null` if the drag is not active.
     */
    tabLayout: ITabLayout[] | null;

    /**
     * The bounding client rect of the tab bar content node.
     *
     * This will be `null` if the drag is not active.
     */
    contentRect: DOMRect | null;

    /**
     * The disposable to clean up the cursor override.
     *
     * This will be `null` if the drag is not active.
     */
    override: IDisposable | null;

    /**
     * Whether the drag is currently active.
     */
    dragActive: boolean;

    /**
     * Whether the drag has been aborted.
     */
    dragAborted: boolean;

    /**
     * Whether a detach request as been made.
     */
    detachRequested: boolean;
  }

  /**
   * An object which holds layout data for a tab.
   */
  export interface ITabLayout {
    /**
     * The left/top margin value for the tab.
     */
    margin: number;

    /**
     * The offset left/top position of the tab.
     */
    pos: number;

    /**
     * The offset width/height of the tab.
     */
    size: number;
  }

  /**
   * Create the DOM node for a tab bar.
   */
  export function createNode(): HTMLDivElement {
    const node = document.createElement('div');
    const content = document.createElement('ul');
    content.setAttribute('role', 'tablist');
    content.className = 'lm-TabBar-content';
    node.appendChild(content);

    const add = document.createElement('div');
    add.className = 'lm-TabBar-addButton lm-mod-hidden';
    add.setAttribute('tabindex', '-1');
    add.setAttribute('role', 'button');
    node.appendChild(add);
    return node;
  }

  /**
   * Coerce a title or options into a real title.
   */
  export function asTitle<T>(value: Title<T> | Title.IOptions<T>): Title<T> {
    return value instanceof Title ? value : new Title<T>(value);
  }

  /**
   * Parse the transition duration for a tab node.
   */
  export function parseTransitionDuration(tab: HTMLElement): number {
    const style = window.getComputedStyle(tab);
    return 1000 * (parseFloat(style.transitionDuration!) || 0);
  }

  /**
   * Get a snapshot of the current tab layout values.
   */
  export function snapTabLayout(
    tabs: HTMLCollection,
    orientation: TabBar.Orientation,
  ): ITabLayout[] {
    const layout = new Array<ITabLayout>(tabs.length);
    for (let i = 0, n = tabs.length; i < n; ++i) {
      const node = tabs[i] as HTMLElement;
      const style = window.getComputedStyle(node);
      if (orientation === 'horizontal') {
        layout[i] = {
          pos: node.offsetLeft,
          size: node.offsetWidth,
          margin: parseFloat(style.marginLeft!) || 0,
        };
      } else {
        layout[i] = {
          pos: node.offsetTop,
          size: node.offsetHeight,
          margin: parseFloat(style.marginTop!) || 0,
        };
      }
    }
    return layout;
  }

  /**
   * Test if the event exceeds the drag threshold.
   */
  export function dragExceeded(data: IDragData, event: MouseEvent): boolean {
    const dx = Math.abs(event.clientX - data.pressX);
    const dy = Math.abs(event.clientY - data.pressY);
    return dx >= DRAG_THRESHOLD || dy >= DRAG_THRESHOLD;
  }

  /**
   * Test if the event exceeds the drag detach threshold.
   */
  export function detachExceeded(data: IDragData, event: MouseEvent): boolean {
    const rect = data.contentRect!;
    return (
      event.clientX < rect.left - DETACH_THRESHOLD ||
      event.clientX >= rect.right + DETACH_THRESHOLD ||
      event.clientY < rect.top - DETACH_THRESHOLD ||
      event.clientY >= rect.bottom + DETACH_THRESHOLD
    );
  }

  /**
   * Update the relative tab positions and computed target index.
   */
  export function layoutTabs(
    tabs: HTMLCollection,
    data: IDragData,
    event: MouseEvent,
    orientation: TabBar.Orientation,
  ): void {
    // Compute the orientation-sensitive values.
    let pressPos: number;
    let localPos: number;
    let clientPos: number;
    let clientSize: number;
    if (orientation === 'horizontal') {
      pressPos = data.pressX;
      localPos = event.clientX - data.contentRect!.left;
      clientPos = event.clientX;
      clientSize = data.contentRect!.width;
    } else {
      pressPos = data.pressY;
      localPos = event.clientY - data.contentRect!.top;
      clientPos = event.clientY;
      clientSize = data.contentRect!.height;
    }

    // Compute the target data.
    let targetIndex = data.index;
    const targetPos = localPos - data.tabPressPos;
    const targetEnd = targetPos + data.tabSize;

    // Update the relative tab positions.
    for (let i = 0, n = tabs.length; i < n; ++i) {
      let pxPos: string;
      const layout = data.tabLayout![i];
      const threshold = layout.pos + (layout.size >> 1);
      if (i < data.index && targetPos < threshold) {
        pxPos = `${data.tabSize + data.tabLayout![i + 1].margin}px`;
        targetIndex = Math.min(targetIndex, i);
      } else if (i > data.index && targetEnd > threshold) {
        pxPos = `${-data.tabSize - layout.margin}px`;
        targetIndex = Math.max(targetIndex, i);
      } else if (i === data.index) {
        const ideal = clientPos - pressPos;
        const limit = clientSize - (data.tabPos + data.tabSize);
        pxPos = `${Math.max(-data.tabPos, Math.min(ideal, limit))}px`;
      } else {
        pxPos = '';
      }
      if (orientation === 'horizontal') {
        (tabs[i] as HTMLElement).style.left = pxPos;
      } else {
        (tabs[i] as HTMLElement).style.top = pxPos;
      }
    }

    // Update the computed target index.
    data.targetIndex = targetIndex;
  }

  /**
   * Position the drag tab at its final resting relative position.
   */
  export function finalizeTabPosition(
    data: IDragData,
    orientation: TabBar.Orientation,
  ): void {
    // Compute the orientation-sensitive client size.
    let clientSize: number;
    if (orientation === 'horizontal') {
      clientSize = data.contentRect!.width;
    } else {
      clientSize = data.contentRect!.height;
    }

    // Compute the ideal final tab position.
    let ideal: number;
    if (data.targetIndex === data.index) {
      ideal = 0;
    } else if (data.targetIndex > data.index) {
      const tgt = data.tabLayout![data.targetIndex];
      ideal = tgt.pos + tgt.size - data.tabSize - data.tabPos;
    } else {
      const tgt = data.tabLayout![data.targetIndex];
      ideal = tgt.pos - data.tabPos;
    }

    // Compute the tab position limit.
    const limit = clientSize - (data.tabPos + data.tabSize);
    const final = Math.max(-data.tabPos, Math.min(ideal, limit));

    // Set the final orientation-sensitive position.
    if (orientation === 'horizontal') {
      data.tab.style.left = `${final}px`;
    } else {
      data.tab.style.top = `${final}px`;
    }
  }

  /**
   * Reset the relative positions of the given tabs.
   */
  export function resetTabPositions(
    tabs: HTMLCollection,
    orientation: TabBar.Orientation,
  ): void {
    for (const tab of tabs) {
      if (orientation === 'horizontal') {
        (tab as HTMLElement).style.left = '';
      } else {
        (tab as HTMLElement).style.top = '';
      }
    }
  }
}
