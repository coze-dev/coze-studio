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
import { type Message, MessageLoop } from '../messaging';
import { ElementExt } from '../domutils';
import { ArrayExt, empty } from '../algorithm';
import { Widget } from './widget';
import Utils from './utils';
import { TabBar } from './tabbar';
import { Layout, LayoutItem } from './layout';
import { BoxEngine, BoxSizer } from './boxengine';

/**
 * A layout which provides a flexible docking arrangement.
 *
 * #### Notes
 * The consumer of this layout is responsible for handling all signals
 * from the generated tab bars and managing the visibility of widgets
 * and tab bars as needed.
 */
export class DockLayout extends Layout {
  /**
   * Construct a new dock layout.
   *
   * @param options - The options for initializing the layout.
   */
  constructor(options: DockLayout.IOptions) {
    super();
    this.renderer = options.renderer;
    if (options.spacing !== undefined) {
      this._spacing = Utils.clampDimension(options.spacing);
    }
    this._document = options.document || document;
    this._hiddenMode =
      options.hiddenMode !== undefined
        ? options.hiddenMode
        : Widget.HiddenMode.Display;
  }

  /**
   * Dispose of the resources held by the layout.
   *
   * #### Notes
   * This will clear and dispose all widgets in the layout.
   */
  dispose(): void {
    // Get an iterator over the widgets in the layout.
    const widgets = this[Symbol.iterator]();

    // Dispose of the layout items.
    this._items.forEach(item => {
      item.dispose();
    });

    // Clear the layout state before disposing the widgets.
    this._box = null;
    this._root = null;
    this._items.clear();

    // Dispose of the widgets contained in the old layout root.
    for (const widget of widgets) {
      widget.dispose();
    }

    // Dispose of the base class.
    super.dispose();
  }

  /**
   * The renderer used by the dock layout.
   */
  readonly renderer: DockLayout.IRenderer;

  /**
   * The method for hiding child widgets.
   *
   * #### Notes
   * If there is only one child widget, `Display` hiding mode will be used
   * regardless of this setting.
   */
  get hiddenMode(): Widget.HiddenMode {
    return this._hiddenMode;
  }

  set hiddenMode(v: Widget.HiddenMode) {
    if (this._hiddenMode === v) {
      return;
    }
    this._hiddenMode = v;
    for (const bar of this.tabBars()) {
      if (bar.titles.length > 1) {
        for (const title of bar.titles) {
          title.owner.hiddenMode = this._hiddenMode;
        }
      }
    }
  }

  /**
   * Get the inter-element spacing for the dock layout.
   */
  get spacing(): number {
    return this._spacing;
  }

  /**
   * Set the inter-element spacing for the dock layout.
   */
  set spacing(value: number) {
    value = Utils.clampDimension(value);
    if (this._spacing === value) {
      return;
    }
    this._spacing = value;
    if (!this.parent) {
      return;
    }
    this.parent.fit();
  }

  /**
   * Whether the dock layout is empty.
   */
  get isEmpty(): boolean {
    return this._root === null;
  }

  /**
   * Create an iterator over all widgets in the layout.
   *
   * @returns A new iterator over the widgets in the layout.
   *
   * #### Notes
   * This iterator includes the generated tab bars.
   */
  [Symbol.iterator](): IterableIterator<Widget> {
    return this._root ? this._root.iterAllWidgets() : empty();
  }

  /**
   * Create an iterator over the user widgets in the layout.
   *
   * @returns A new iterator over the user widgets in the layout.
   *
   * #### Notes
   * This iterator does not include the generated tab bars.
   */
  widgets(): IterableIterator<Widget> {
    return this._root ? this._root.iterUserWidgets() : empty();
  }

  /**
   * Create an iterator over the selected widgets in the layout.
   *
   * @returns A new iterator over the selected user widgets.
   *
   * #### Notes
   * This iterator yields the widgets corresponding to the current tab
   * of each tab bar in the layout.
   */
  selectedWidgets(): IterableIterator<Widget> {
    return this._root ? this._root.iterSelectedWidgets() : empty();
  }

  /**
   * Create an iterator over the tab bars in the layout.
   *
   * @returns A new iterator over the tab bars in the layout.
   *
   * #### Notes
   * This iterator does not include the user widgets.
   */
  tabBars(): IterableIterator<TabBar<Widget>> {
    return this._root ? this._root.iterTabBars() : empty();
  }

  /**
   * Create an iterator over the handles in the layout.
   *
   * @returns A new iterator over the handles in the layout.
   */
  handles(): IterableIterator<HTMLDivElement> {
    return this._root ? this._root.iterHandles() : empty();
  }

  /**
   * Move a handle to the given offset position.
   *
   * @param handle - The handle to move.
   *
   * @param offsetX - The desired offset X position of the handle.
   *
   * @param offsetY - The desired offset Y position of the handle.
   *
   * #### Notes
   * If the given handle is not contained in the layout, this is no-op.
   *
   * The handle will be moved as close as possible to the desired
   * position without violating any of the layout constraints.
   *
   * Only one of the coordinates is used depending on the orientation
   * of the handle. This method accepts both coordinates to make it
   * easy to invoke from a mouse move event without needing to know
   * the handle orientation.
   */
  moveHandle(handle: HTMLDivElement, offsetX: number, offsetY: number): void {
    // Bail early if there is no root or if the handle is hidden.
    const hidden = handle.classList.contains('lm-mod-hidden');
    if (!this._root || hidden) {
      return;
    }

    // Lookup the split node for the handle.
    const data = this._root.findSplitNode(handle);
    if (!data) {
      return;
    }

    // Compute the desired delta movement for the handle.
    let delta: number;
    if (data.node.orientation === 'horizontal') {
      delta = offsetX - handle.offsetLeft;
    } else {
      delta = offsetY - handle.offsetTop;
    }

    // Bail if there is no handle movement.
    if (delta === 0) {
      return;
    }

    // Prevent sibling resizing unless needed.
    data.node.holdSizes();

    // Adjust the sizers to reflect the handle movement.
    BoxEngine.adjust(data.node.sizers, data.index, delta);

    // Update the layout of the widgets.
    if (this.parent) {
      this.parent.update();
    }
  }

  /**
   * Save the current configuration of the dock layout.
   *
   * @returns A new config object for the current layout state.
   *
   * #### Notes
   * The return value can be provided to the `restoreLayout` method
   * in order to restore the layout to its current configuration.
   */
  saveLayout(): DockLayout.ILayoutConfig {
    // Bail early if there is no root.
    if (!this._root) {
      return { main: null };
    }

    // Hold the current sizes in the layout tree.
    this._root.holdAllSizes();

    // Return the layout config.
    return { main: this._root.createConfig() };
  }

  /**
   * Restore the layout to a previously saved configuration.
   *
   * @param config - The layout configuration to restore.
   *
   * #### Notes
   * Widgets which currently belong to the layout but which are not
   * contained in the config will be unparented.
   */
  restoreLayout(config: DockLayout.ILayoutConfig): void {
    // Create the widget set for validating the config.
    const widgetSet = new Set<Widget>();

    // Normalize the main area config and collect the widgets.
    let mainConfig: DockLayout.AreaConfig | null;
    if (config.main) {
      mainConfig = Private.normalizeAreaConfig(config.main, widgetSet);
    } else {
      mainConfig = null;
    }

    // Create iterators over the old content.
    const oldWidgets = this.widgets();
    const oldTabBars = this.tabBars();
    const oldHandles = this.handles();

    // Clear the root before removing the old content.
    this._root = null;

    // Unparent the old widgets which are not in the new config.
    for (const widget of oldWidgets) {
      if (!widgetSet.has(widget)) {
        widget.parent = null;
      }
    }

    // Dispose of the old tab bars.
    for (const tabBar of oldTabBars) {
      tabBar.dispose();
    }

    // Remove the old handles.
    for (const handle of oldHandles) {
      if (handle.parentNode) {
        handle.parentNode.removeChild(handle);
      }
    }

    // Reparent the new widgets to the current parent.
    for (const widget of widgetSet) {
      widget.parent = this.parent;
    }

    // Create the root node for the new config.
    if (mainConfig) {
      this._root = Private.realizeAreaConfig(
        mainConfig,
        {
          // Ignoring optional `document` argument as we must reuse `this._document`
          createTabBar: (document?: Document | ShadowRoot) =>
            this._createTabBar(),
          createHandle: () => this._createHandle(),
        },
        this._document,
      );
    } else {
      this._root = null;
    }

    // If there is no parent, there is nothing more to do.
    if (!this.parent) {
      return;
    }

    // Attach the new widgets to the parent.
    widgetSet.forEach(widget => {
      this.attachWidget(widget);
    });

    // Post a fit request to the parent.
    this.parent.fit();
  }

  /**
   * Add a widget to the dock layout.
   *
   * @param widget - The widget to add to the dock layout.
   *
   * @param options - The additional options for adding the widget.
   *
   * #### Notes
   * The widget will be moved if it is already contained in the layout.
   *
   * An error will be thrown if the reference widget is invalid.
   */
  addWidget(widget: Widget, options: DockLayout.IAddOptions = {}): void {
    // Parse the options.
    const ref = options.ref || null;
    const mode = options.mode || 'tab-after';

    // Find the tab node which holds the reference widget.
    let refNode: Private.TabLayoutNode | null = null;
    if (this._root && ref) {
      refNode = this._root.findTabNode(ref);
    }

    // Throw an error if the reference widget is invalid.
    if (ref && !refNode) {
      throw new Error('Reference widget is not in the layout.');
    }

    // Reparent the widget to the current layout parent.
    widget.parent = this.parent;

    // Insert the widget according to the insert mode.
    switch (mode) {
      case 'tab-after':
        this._insertTab(widget, ref, refNode, true);
        break;
      case 'tab-before':
        this._insertTab(widget, ref, refNode, false);
        break;
      case 'split-top':
        this._insertSplit(widget, ref, refNode, 'vertical', false);
        break;
      case 'split-left':
        this._insertSplit(widget, ref, refNode, 'horizontal', false);
        break;
      case 'split-right':
        this._insertSplit(widget, ref, refNode, 'horizontal', true);
        break;
      case 'split-bottom':
        this._insertSplit(widget, ref, refNode, 'vertical', true);
        break;
      case 'merge-top':
        this._insertSplit(widget, ref, refNode, 'vertical', false, true);
        break;
      case 'merge-left':
        this._insertSplit(widget, ref, refNode, 'horizontal', false, true);
        break;
      case 'merge-right':
        this._insertSplit(widget, ref, refNode, 'horizontal', true, true);
        break;
      case 'merge-bottom':
        this._insertSplit(widget, ref, refNode, 'vertical', true, true);
        break;
    }

    // Do nothing else if there is no parent widget.
    if (!this.parent) {
      return;
    }

    // Ensure the widget is attached to the parent widget.
    this.attachWidget(widget);

    // Post a fit request for the parent widget.
    this.parent.fit();
  }

  /**
   * Remove a widget from the layout.
   *
   * @param widget - The widget to remove from the layout.
   *
   * #### Notes
   * A widget is automatically removed from the layout when its `parent`
   * is set to `null`. This method should only be invoked directly when
   * removing a widget from a layout which has yet to be installed on a
   * parent widget.
   *
   * This method does *not* modify the widget's `parent`.
   */
  removeWidget(widget: Widget): void {
    // Remove the widget from its current layout location.
    this._removeWidget(widget);

    // Do nothing else if there is no parent widget.
    if (!this.parent) {
      return;
    }

    // Detach the widget from the parent widget.
    this.detachWidget(widget);

    // Post a fit request for the parent widget.
    this.parent.fit();
  }

  /**
   * Find the tab area which contains the given client position.
   *
   * @param clientX - The client X position of interest.
   *
   * @param clientY - The client Y position of interest.
   *
   * @returns The geometry of the tab area at the given position, or
   *   `null` if there is no tab area at the given position.
   */
  hitTestTabAreas(
    clientX: number,
    clientY: number,
  ): DockLayout.ITabAreaGeometry | null {
    // Bail early if hit testing cannot produce valid results.
    if (!this._root || !this.parent || !this.parent.isVisible) {
      return null;
    }

    // Ensure the parent box sizing data is computed.
    if (!this._box) {
      this._box = ElementExt.boxSizing(this.parent.node);
    }

    // Convert from client to local coordinates.
    const rect = this.parent.node.getBoundingClientRect();
    const x = clientX - rect.left - this._box.borderLeft;
    const y = clientY - rect.top - this._box.borderTop;

    // Find the tab layout node at the local position.
    const tabNode = this._root.hitTestTabNodes(x, y);

    // Bail if a tab layout node was not found.
    if (!tabNode) {
      return null;
    }

    // Extract the data from the tab node.
    const { tabBar, top, left, width, height } = tabNode;

    // Compute the right and bottom edges of the tab area.
    const borderWidth = this._box.borderLeft + this._box.borderRight;
    const borderHeight = this._box.borderTop + this._box.borderBottom;
    const right = rect.width - borderWidth - (left + width);
    const bottom = rect.height - borderHeight - (top + height);

    // Return the hit test results.
    return { tabBar, x, y, top, left, right, bottom, width, height };
  }

  /**
   * Perform layout initialization which requires the parent widget.
   */
  protected init(): void {
    // Perform superclass initialization.
    super.init();

    // Attach each widget to the parent.
    for (const widget of this) {
      this.attachWidget(widget);
    }

    // Attach each handle to the parent.
    for (const handle of this.handles()) {
      this.parent!.node.appendChild(handle);
    }

    // Post a fit request for the parent widget.
    this.parent!.fit();
  }

  /**
   * Attach the widget to the layout parent widget.
   *
   * @param widget - The widget to attach to the parent.
   *
   * #### Notes
   * This is a no-op if the widget is already attached.
   */
  protected attachWidget(widget: Widget): void {
    // Do nothing if the widget is already attached.
    if (this.parent!.node === widget.node.parentNode) {
      return;
    }

    // Create the layout item for the widget.
    this._items.set(widget, new LayoutItem(widget));

    // Send a `'before-attach'` message if the parent is attached.
    if (this.parent!.isAttached) {
      MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
    }

    // Add the widget's node to the parent.
    this.parent!.node.appendChild(widget.node);

    // Send an `'after-attach'` message if the parent is attached.
    if (this.parent!.isAttached) {
      MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
    }
  }

  /**
   * Detach the widget from the layout parent widget.
   *
   * @param widget - The widget to detach from the parent.
   *
   * #### Notes
   * This is a no-op if the widget is not attached.
   */
  protected detachWidget(widget: Widget): void {
    // Do nothing if the widget is not attached.
    if (this.parent!.node !== widget.node.parentNode) {
      return;
    }

    // Send a `'before-detach'` message if the parent is attached.
    if (this.parent!.isAttached) {
      MessageLoop.sendMessage(widget, Widget.Msg.BeforeDetach);
    }

    // Remove the widget's node from the parent.
    this.parent!.node.removeChild(widget.node);

    // Send an `'after-detach'` message if the parent is attached.
    if (this.parent!.isAttached) {
      MessageLoop.sendMessage(widget, Widget.Msg.AfterDetach);
    }

    // Delete the layout item for the widget.
    const item = this._items.get(widget);
    if (item) {
      this._items.delete(widget);
      item.dispose();
    }
  }

  /**
   * A message handler invoked on a `'before-show'` message.
   */
  protected onBeforeShow(msg: Message): void {
    super.onBeforeShow(msg);
    this.parent!.update();
  }

  /**
   * A message handler invoked on a `'before-attach'` message.
   */
  protected onBeforeAttach(msg: Message): void {
    super.onBeforeAttach(msg);
    this.parent!.fit();
  }

  /**
   * A message handler invoked on a `'child-shown'` message.
   */
  protected onChildShown(msg: Widget.ChildMessage): void {
    this.parent!.fit();
  }

  /**
   * A message handler invoked on a `'child-hidden'` message.
   */
  protected onChildHidden(msg: Widget.ChildMessage): void {
    this.parent!.fit();
  }

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(msg: Widget.ResizeMessage): void {
    if (this.parent!.isVisible) {
      this._update(msg.width, msg.height);
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.parent!.isVisible) {
      this._update(-1, -1);
    }
  }

  /**
   * A message handler invoked on a `'fit-request'` message.
   */
  protected onFitRequest(msg: Message): void {
    if (this.parent!.isAttached) {
      this._fit();
    }
  }

  /**
   * Remove the specified widget from the layout structure.
   *
   * #### Notes
   * This is a no-op if the widget is not in the layout tree.
   *
   * This does not detach the widget from the parent node.
   */
  private _removeWidget(widget: Widget): void {
    // Bail early if there is no layout root.
    if (!this._root) {
      return;
    }

    // Find the tab node which contains the given widget.
    const tabNode = this._root.findTabNode(widget);

    // Bail early if the tab node is not found.
    if (!tabNode) {
      return;
    }

    Private.removeAria(widget);

    // If there are multiple tabs, just remove the widget's tab.
    if (tabNode.tabBar.titles.length > 1) {
      tabNode.tabBar.removeTab(widget.title);
      if (
        this._hiddenMode === Widget.HiddenMode.Scale &&
        tabNode.tabBar.titles.length == 1
      ) {
        const existingWidget = tabNode.tabBar.titles[0].owner;
        existingWidget.hiddenMode = Widget.HiddenMode.Display;
      }
      return;
    }

    // Otherwise, the tab node needs to be removed...

    // Dispose the tab bar.
    tabNode.tabBar.dispose();

    // Handle the case where the tab node is the root.
    if (this._root === tabNode) {
      this._root = null;
      return;
    }

    // Otherwise, remove the tab node from its parent...

    // Prevent widget resizing unless needed.
    this._root.holdAllSizes();

    // Clear the parent reference on the tab node.
    const splitNode = tabNode.parent!;
    tabNode.parent = null;

    // Remove the tab node from its parent split node.
    const i = ArrayExt.removeFirstOf(splitNode.children, tabNode);
    const handle = ArrayExt.removeAt(splitNode.handles, i)!;
    ArrayExt.removeAt(splitNode.sizers, i);

    // Remove the handle from its parent DOM node.
    if (handle.parentNode) {
      handle.parentNode.removeChild(handle);
    }

    // If there are multiple children, just update the handles.
    if (splitNode.children.length > 1) {
      splitNode.syncHandles();
      return;
    }

    // Otherwise, the split node also needs to be removed...

    // Clear the parent reference on the split node.
    const maybeParent = splitNode.parent;
    splitNode.parent = null;

    // Lookup the remaining child node and handle.
    const childNode = splitNode.children[0];
    const childHandle = splitNode.handles[0];

    // Clear the split node data.
    splitNode.children.length = 0;
    splitNode.handles.length = 0;
    splitNode.sizers.length = 0;

    // Remove the child handle from its parent node.
    if (childHandle.parentNode) {
      childHandle.parentNode.removeChild(childHandle);
    }

    // Handle the case where the split node is the root.
    if (this._root === splitNode) {
      childNode.parent = null;
      this._root = childNode;
      return;
    }

    // Otherwise, move the child node to the parent node...
    const parentNode = maybeParent!;

    // Lookup the index of the split node.
    const j = parentNode.children.indexOf(splitNode);

    // Handle the case where the child node is a tab node.
    if (childNode instanceof Private.TabLayoutNode) {
      childNode.parent = parentNode;
      parentNode.children[j] = childNode;
      return;
    }

    // Remove the split data from the parent.
    const splitHandle = ArrayExt.removeAt(parentNode.handles, j)!;
    ArrayExt.removeAt(parentNode.children, j);
    ArrayExt.removeAt(parentNode.sizers, j);

    // Remove the handle from its parent node.
    if (splitHandle.parentNode) {
      splitHandle.parentNode.removeChild(splitHandle);
    }

    // The child node and the split parent node will have the same
    // orientation. Merge the grand-children with the parent node.
    for (let i = 0, n = childNode.children.length; i < n; ++i) {
      const gChild = childNode.children[i];
      const gHandle = childNode.handles[i];
      const gSizer = childNode.sizers[i];
      ArrayExt.insert(parentNode.children, j + i, gChild);
      ArrayExt.insert(parentNode.handles, j + i, gHandle);
      ArrayExt.insert(parentNode.sizers, j + i, gSizer);
      gChild.parent = parentNode;
    }

    // Clear the child node.
    childNode.children.length = 0;
    childNode.handles.length = 0;
    childNode.sizers.length = 0;
    childNode.parent = null;

    // Sync the handles on the parent node.
    parentNode.syncHandles();
  }

  /**
   * Create the tab layout node to hold the widget.
   */
  private _createTabNode(widget: Widget): Private.TabLayoutNode {
    const tabNode = new Private.TabLayoutNode(this._createTabBar());
    tabNode.tabBar.addTab(widget.title);
    Private.addAria(widget, tabNode.tabBar);
    return tabNode;
  }

  /**
   * Insert a widget next to an existing tab.
   *
   * #### Notes
   * This does not attach the widget to the parent widget.
   */
  private _insertTab(
    widget: Widget,
    ref: Widget | null,
    refNode: Private.TabLayoutNode | null,
    after: boolean,
  ): void {
    // Do nothing if the tab is inserted next to itself.
    if (widget === ref) {
      return;
    }

    // Create the root if it does not exist.
    if (!this._root) {
      const tabNode = new Private.TabLayoutNode(this._createTabBar());
      tabNode.tabBar.addTab(widget.title);
      this._root = tabNode;
      Private.addAria(widget, tabNode.tabBar);
      return;
    }

    // Use the first tab node as the ref node if needed.
    if (!refNode) {
      refNode = this._root.findFirstTabNode()!;
    }

    // If the widget is not contained in the ref node, ensure it is
    // removed from the layout and hidden before being added again.
    if (refNode.tabBar.titles.indexOf(widget.title) === -1) {
      this._removeWidget(widget);
      widget.hide();
    }

    // Lookup the target index for inserting the tab.
    let index: number;
    if (ref) {
      index = refNode.tabBar.titles.indexOf(ref.title);
    } else {
      index = refNode.tabBar.currentIndex;
    }

    // Using transform create an additional layer in the pixel pipeline
    // to limit the number of layer, it is set only if there is more than one widget.
    if (this._hiddenMode === Widget.HiddenMode.Scale) {
      if (refNode.tabBar.titles.length === 0) {
        // Singular tab should use display mode to limit number of layers.
        widget.hiddenMode = Widget.HiddenMode.Display;
      } else if (refNode.tabBar.titles.length == 1) {
        // If we are adding a second tab, switch the existing tab back to scale.
        const existingWidget = refNode.tabBar.titles[0].owner;
        existingWidget.hiddenMode = Widget.HiddenMode.Scale;
      } else {
        // For the third and subsequent tabs no special action is needed.
        widget.hiddenMode = Widget.HiddenMode.Scale;
      }
    } else {
      // For all other modes just propagate the current mode.
      widget.hiddenMode = this._hiddenMode;
    }

    // Insert the widget's tab relative to the target index.
    refNode.tabBar.insertTab(index + (after ? 1 : 0), widget.title);
    Private.addAria(widget, refNode.tabBar);
  }

  /**
   * Insert a widget as a new split area.
   *
   * #### Notes
   * This does not attach the widget to the parent widget.
   */
  private _insertSplit(
    widget: Widget,
    ref: Widget | null,
    refNode: Private.TabLayoutNode | null,
    orientation: Private.Orientation,
    after: boolean,
    merge = false,
  ): void {
    // Do nothing if there is no effective split.
    if (widget === ref && refNode && refNode.tabBar.titles.length === 1) {
      return;
    }

    // Ensure the widget is removed from the current layout.
    this._removeWidget(widget);

    // Set the root if it does not exist.
    if (!this._root) {
      this._root = this._createTabNode(widget);
      return;
    }

    // If the ref node parent is null, split the root.
    if (!refNode || !refNode.parent) {
      // Ensure the root is split with the correct orientation.
      const root = this._splitRoot(orientation);

      // Determine the insert index for the new tab node.
      const i = after ? root.children.length : 0;

      // Normalize the split node.
      root.normalizeSizes();

      // Create the sizer for new tab node.
      const sizer = Private.createSizer(refNode ? 1 : Private.GOLDEN_RATIO);

      // Insert the tab node sized to the golden ratio.
      const tabNode = this._createTabNode(widget);
      ArrayExt.insert(root.children, i, tabNode);
      ArrayExt.insert(root.sizers, i, sizer);
      ArrayExt.insert(root.handles, i, this._createHandle());
      tabNode.parent = root;

      // Re-normalize the split node to maintain the ratios.
      root.normalizeSizes();

      // Finally, synchronize the visibility of the handles.
      root.syncHandles();
      return;
    }

    // Lookup the split node for the ref widget.
    const splitNode = refNode.parent;

    // If the split node already had the correct orientation,
    // the widget can be inserted into the split node directly.
    if (splitNode.orientation === orientation) {
      // Find the index of the ref node.
      const i = splitNode.children.indexOf(refNode);

      // Conditionally reuse a tab layout found in the wanted position.
      if (merge) {
        const j = i + (after ? 1 : -1);
        const sibling = splitNode.children[j];
        if (sibling instanceof Private.TabLayoutNode) {
          this._insertTab(widget, null, sibling, true);
          ++sibling.tabBar.currentIndex;
          return;
        }
      }

      // Normalize the split node.
      splitNode.normalizeSizes();

      // Consume half the space for the insert location.
      const s = (splitNode.sizers[i].sizeHint /= 2);

      // Insert the tab node sized to the other half.
      const j = i + (after ? 1 : 0);
      const tabNode = this._createTabNode(widget);
      ArrayExt.insert(splitNode.children, j, tabNode);
      ArrayExt.insert(splitNode.sizers, j, Private.createSizer(s));
      ArrayExt.insert(splitNode.handles, j, this._createHandle());
      tabNode.parent = splitNode;

      // Finally, synchronize the visibility of the handles.
      splitNode.syncHandles();
      return;
    }

    // Remove the ref node from the split node.
    const i = ArrayExt.removeFirstOf(splitNode.children, refNode);

    // Create a new normalized split node for the children.
    const childNode = new Private.SplitLayoutNode(orientation);
    childNode.normalized = true;

    // Add the ref node sized to half the space.
    childNode.children.push(refNode);
    childNode.sizers.push(Private.createSizer(0.5));
    childNode.handles.push(this._createHandle());
    refNode.parent = childNode;

    // Add the tab node sized to the other half.
    const j = after ? 1 : 0;
    const tabNode = this._createTabNode(widget);
    ArrayExt.insert(childNode.children, j, tabNode);
    ArrayExt.insert(childNode.sizers, j, Private.createSizer(0.5));
    ArrayExt.insert(childNode.handles, j, this._createHandle());
    tabNode.parent = childNode;

    // Synchronize the visibility of the handles.
    childNode.syncHandles();

    // Finally, add the new child node to the original split node.
    ArrayExt.insert(splitNode.children, i, childNode);
    childNode.parent = splitNode;
  }

  /**
   * Ensure the root is a split node with the given orientation.
   */
  private _splitRoot(
    orientation: Private.Orientation,
  ): Private.SplitLayoutNode {
    // Bail early if the root already meets the requirements.
    const oldRoot = this._root;
    if (oldRoot instanceof Private.SplitLayoutNode) {
      if (oldRoot.orientation === orientation) {
        return oldRoot;
      }
    }

    // Create a new root node with the specified orientation.
    const newRoot = (this._root = new Private.SplitLayoutNode(orientation));

    // Add the old root to the new root.
    if (oldRoot) {
      newRoot.children.push(oldRoot);
      newRoot.sizers.push(Private.createSizer(0));
      newRoot.handles.push(this._createHandle());
      oldRoot.parent = newRoot;
    }

    // Return the new root as a convenience.
    return newRoot;
  }

  /**
   * Fit the layout to the total size required by the widgets.
   */
  private _fit(): void {
    // Set up the computed minimum size.
    let minW = 0;
    let minH = 0;

    // Update the size limits for the layout tree.
    if (this._root) {
      const limits = this._root.fit(this._spacing, this._items);
      minW = limits.minWidth;
      minH = limits.minHeight;
    }

    // Update the box sizing and add it to the computed min size.
    const box = (this._box = ElementExt.boxSizing(this.parent!.node));
    minW += box.horizontalSum;
    minH += box.verticalSum;

    // Update the parent's min size constraints.
    const { style } = this.parent!.node;
    style.minWidth = `${minW}px`;
    style.minHeight = `${minH}px`;

    // Set the dirty flag to ensure only a single update occurs.
    this._dirty = true;

    // Notify the ancestor that it should fit immediately. This may
    // cause a resize of the parent, fulfilling the required update.
    if (this.parent!.parent) {
      MessageLoop.sendMessage(this.parent!.parent!, Widget.Msg.FitRequest);
    }

    // If the dirty flag is still set, the parent was not resized.
    // Trigger the required update on the parent widget immediately.
    if (this._dirty) {
      MessageLoop.sendMessage(this.parent!, Widget.Msg.UpdateRequest);
    }
  }

  /**
   * Update the layout position and size of the widgets.
   *
   * The parent offset dimensions should be `-1` if unknown.
   */
  private _update(offsetWidth: number, offsetHeight: number): void {
    // Clear the dirty flag to indicate the update occurred.
    this._dirty = false;

    // Bail early if there is no root layout node.
    if (!this._root) {
      return;
    }

    // Measure the parent if the offset dimensions are unknown.
    if (offsetWidth < 0) {
      offsetWidth = this.parent!.node.offsetWidth;
    }
    if (offsetHeight < 0) {
      offsetHeight = this.parent!.node.offsetHeight;
    }

    // Ensure the parent box sizing data is computed.
    if (!this._box) {
      this._box = ElementExt.boxSizing(this.parent!.node);
    }

    // Compute the actual layout bounds adjusted for border and padding.
    const x = this._box.paddingTop;
    const y = this._box.paddingLeft;
    const width = offsetWidth - this._box.horizontalSum;
    const height = offsetHeight - this._box.verticalSum;

    // Update the geometry of the layout tree.
    this._root.update(x, y, width, height, this._spacing, this._items);
  }

  /**
   * Create a new tab bar for use by the dock layout.
   *
   * #### Notes
   * The tab bar will be attached to the parent if it exists.
   */
  private _createTabBar(): TabBar<Widget> {
    // Create the tab bar using the renderer.
    const tabBar = this.renderer.createTabBar(this._document);

    // Enforce necessary tab bar behavior.
    tabBar.orientation = 'horizontal';

    // Attach the tab bar to the parent if possible.
    if (this.parent) {
      this.attachWidget(tabBar);
    }

    // Return the initialized tab bar.
    return tabBar;
  }

  /**
   * Create a new handle for the dock layout.
   *
   * #### Notes
   * The handle will be attached to the parent if it exists.
   */
  private _createHandle(): HTMLDivElement {
    // Create the handle using the renderer.
    const handle = this.renderer.createHandle();

    // Initialize the handle layout behavior.
    const { style } = handle;
    style.position = 'absolute';
    style.contain = 'strict';
    style.top = '0';
    style.left = '0';
    style.width = '0';
    style.height = '0';

    // Attach the handle to the parent if it exists.
    if (this.parent) {
      this.parent.node.appendChild(handle);
    }

    // Return the initialized handle.
    return handle;
  }

  private _spacing = 4;

  private _dirty = false;

  private _root: Private.LayoutNode | null = null;

  private _box: ElementExt.IBoxSizing | null = null;

  private _document: Document | ShadowRoot;

  private _hiddenMode: Widget.HiddenMode;

  private _items: Private.ItemMap = new Map<Widget, LayoutItem>();
}

/**
 * The namespace for the `DockLayout` class statics.
 */
export namespace DockLayout {
  /**
   * An options object for creating a dock layout.
   */
  export interface IOptions {
    /**
     * The document to use with the dock panel.
     *
     * The default is the global `document` instance.
     */
    document?: Document | ShadowRoot;

    /**
     * The method for hiding widgets.
     *
     * The default is `Widget.HiddenMode.Display`.
     */
    hiddenMode?: Widget.HiddenMode;

    /**
     * The renderer to use for the dock layout.
     */
    renderer: IRenderer;

    /**
     * The spacing between items in the layout.
     *
     * The default is `4`.
     */
    spacing?: number;
  }

  /**
   * A renderer for use with a dock layout.
   */
  export interface IRenderer {
    /**
     * Create a new tab bar for use with a dock layout.
     *
     * @returns A new tab bar for a dock layout.
     */
    createTabBar(document?: Document | ShadowRoot): TabBar<Widget>;

    /**
     * Create a new handle node for use with a dock layout.
     *
     * @returns A new handle node for a dock layout.
     */
    createHandle(): HTMLDivElement;
  }

  /**
   * A type alias for the supported insertion modes.
   *
   * An insert mode is used to specify how a widget should be added
   * to the dock layout relative to a reference widget.
   */
  export type InsertMode =
    | /**
     * The area to the top of the reference widget.
     *
     * The widget will be inserted just above the reference widget.
     *
     * If the reference widget is null or invalid, the widget will be
     * inserted at the top edge of the dock layout.
     */
    'split-top'

    /**
     * The area to the left of the reference widget.
     *
     * The widget will be inserted just left of the reference widget.
     *
     * If the reference widget is null or invalid, the widget will be
     * inserted at the left edge of the dock layout.
     */
    | 'split-left'

    /**
     * The area to the right of the reference widget.
     *
     * The widget will be inserted just right of the reference widget.
     *
     * If the reference widget is null or invalid, the widget will be
     * inserted  at the right edge of the dock layout.
     */
    | 'split-right'

    /**
     * The area to the bottom of the reference widget.
     *
     * The widget will be inserted just below the reference widget.
     *
     * If the reference widget is null or invalid, the widget will be
     * inserted at the bottom edge of the dock layout.
     */
    | 'split-bottom'

    /**
     * Like `split-top` but if a tab layout exists above the reference widget,
     * it behaves like `tab-after` with reference to that instead.
     */
    | 'merge-top'

    /**
     * Like `split-left` but if a tab layout exists left of the reference widget,
     * it behaves like `tab-after` with reference to that instead.
     */
    | 'merge-left'

    /**
     * Like `split-right` but if a tab layout exists right of the reference widget,
     * it behaves like `tab-after` with reference to that instead.
     */
    | 'merge-right'

    /**
     * Like `split-bottom` but if a tab layout exists below the reference widget,
     * it behaves like `tab-after` with reference to that instead.
     */
    | 'merge-bottom'

    /**
     * The tab position before the reference widget.
     *
     * The widget will be added as a tab before the reference widget.
     *
     * If the reference widget is null or invalid, a sensible default
     * will be used.
     */
    | 'tab-before'

    /**
     * The tab position after the reference widget.
     *
     * The widget will be added as a tab after the reference widget.
     *
     * If the reference widget is null or invalid, a sensible default
     * will be used.
     */
    | 'tab-after';

  /**
   * An options object for adding a widget to the dock layout.
   */
  export interface IAddOptions {
    /**
     * The insertion mode for adding the widget.
     *
     * The default is `'tab-after'`.
     */
    mode?: InsertMode;

    /**
     * The reference widget for the insert location.
     *
     * The default is `null`.
     */
    ref?: Widget | null;
  }

  /**
   * A layout config object for a tab area.
   */
  export interface ITabAreaConfig {
    /**
     * The discriminated type of the config object.
     */
    type: 'tab-area';

    /**
     * The widgets contained in the tab area.
     */
    widgets: Widget[];

    /**
     * The index of the selected tab.
     */
    currentIndex: number;
  }

  /**
   * A layout config object for a split area.
   */
  export interface ISplitAreaConfig {
    /**
     * The discriminated type of the config object.
     */
    type: 'split-area';

    /**
     * The orientation of the split area.
     */
    orientation: 'horizontal' | 'vertical';

    /**
     * The children in the split area.
     */
    children: AreaConfig[];

    /**
     * The relative sizes of the children.
     */
    sizes: number[];
  }

  /**
   * A type alias for a general area config.
   */
  export type AreaConfig = ITabAreaConfig | ISplitAreaConfig;

  /**
   * A dock layout configuration object.
   */
  export interface ILayoutConfig {
    /**
     * The layout config for the main dock area.
     */
    main: AreaConfig | null;
  }

  /**
   * An object which represents the geometry of a tab area.
   */
  export interface ITabAreaGeometry {
    /**
     * The tab bar for the tab area.
     */
    tabBar: TabBar<Widget>;

    /**
     * The local X position of the hit test in the dock area.
     *
     * #### Notes
     * This is the distance from the left edge of the layout parent
     * widget, to the local X coordinate of the hit test query.
     */
    x: number;

    /**
     * The local Y position of the hit test in the dock area.
     *
     * #### Notes
     * This is the distance from the top edge of the layout parent
     * widget, to the local Y coordinate of the hit test query.
     */
    y: number;

    /**
     * The local coordinate of the top edge of the tab area.
     *
     * #### Notes
     * This is the distance from the top edge of the layout parent
     * widget, to the top edge of the tab area.
     */
    top: number;

    /**
     * The local coordinate of the left edge of the tab area.
     *
     * #### Notes
     * This is the distance from the left edge of the layout parent
     * widget, to the left edge of the tab area.
     */
    left: number;

    /**
     * The local coordinate of the right edge of the tab area.
     *
     * #### Notes
     * This is the distance from the right edge of the layout parent
     * widget, to the right edge of the tab area.
     */
    right: number;

    /**
     * The local coordinate of the bottom edge of the tab area.
     *
     * #### Notes
     * This is the distance from the bottom edge of the layout parent
     * widget, to the bottom edge of the tab area.
     */
    bottom: number;

    /**
     * The width of the tab area.
     *
     * #### Notes
     * This is total width allocated for the tab area.
     */
    width: number;

    /**
     * The height of the tab area.
     *
     * #### Notes
     * This is total height allocated for the tab area.
     */
    height: number;
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * A fraction used for sizing root panels; ~= `1 / golden_ratio`.
   */
  export const GOLDEN_RATIO = 0.618;

  /**
   * A type alias for a dock layout node.
   */
  export type LayoutNode = TabLayoutNode | SplitLayoutNode;

  /**
   * A type alias for the orientation of a split layout node.
   */
  export type Orientation = 'horizontal' | 'vertical';

  /**
   * A type alias for a layout item map.
   */
  export type ItemMap = Map<Widget, LayoutItem>;

  /**
   * Create a box sizer with an initial size hint.
   */
  export function createSizer(hint: number): BoxSizer {
    const sizer = new BoxSizer();
    sizer.sizeHint = hint;
    sizer.size = hint;
    return sizer;
  }

  /**
   * Normalize an area config object and collect the visited widgets.
   */
  export function normalizeAreaConfig(
    config: DockLayout.AreaConfig,
    widgetSet: Set<Widget>,
  ): DockLayout.AreaConfig | null {
    let result: DockLayout.AreaConfig | null;
    if (config.type === 'tab-area') {
      result = normalizeTabAreaConfig(config, widgetSet);
    } else {
      result = normalizeSplitAreaConfig(config, widgetSet);
    }
    return result;
  }

  /**
   * Convert a normalized area config into a layout tree.
   */
  export function realizeAreaConfig(
    config: DockLayout.AreaConfig,
    renderer: DockLayout.IRenderer,
    document: Document | ShadowRoot,
  ): LayoutNode {
    let node: LayoutNode;
    if (config.type === 'tab-area') {
      node = realizeTabAreaConfig(config, renderer, document);
    } else {
      node = realizeSplitAreaConfig(config, renderer, document);
    }
    return node;
  }

  /**
   * A layout node which holds the data for a tabbed area.
   */
  export class TabLayoutNode {
    /**
     * Construct a new tab layout node.
     *
     * @param tabBar - The tab bar to use for the layout node.
     */
    constructor(tabBar: TabBar<Widget>) {
      const tabSizer = new BoxSizer();
      const widgetSizer = new BoxSizer();
      tabSizer.stretch = 0;
      widgetSizer.stretch = 1;
      this.tabBar = tabBar;
      this.sizers = [tabSizer, widgetSizer];
    }

    /**
     * The parent of the layout node.
     */
    parent: SplitLayoutNode | null = null;

    /**
     * The tab bar for the layout node.
     */
    readonly tabBar: TabBar<Widget>;

    /**
     * The sizers for the layout node.
     */
    readonly sizers: [BoxSizer, BoxSizer];

    /**
     * The most recent value for the `top` edge of the layout box.
     */
    get top(): number {
      return this._top;
    }

    /**
     * The most recent value for the `left` edge of the layout box.
     */
    get left(): number {
      return this._left;
    }

    /**
     * The most recent value for the `width` of the layout box.
     */
    get width(): number {
      return this._width;
    }

    /**
     * The most recent value for the `height` of the layout box.
     */
    get height(): number {
      return this._height;
    }

    /**
     * Create an iterator for all widgets in the layout tree.
     */
    *iterAllWidgets(): IterableIterator<Widget> {
      yield this.tabBar;
      yield* this.iterUserWidgets();
    }

    /**
     * Create an iterator for the user widgets in the layout tree.
     */
    *iterUserWidgets(): IterableIterator<Widget> {
      for (const title of this.tabBar.titles) {
        yield title.owner;
      }
    }

    /**
     * Create an iterator for the selected widgets in the layout tree.
     */
    *iterSelectedWidgets(): IterableIterator<Widget> {
      const title = this.tabBar.currentTitle;
      if (title) {
        yield title.owner;
      }
    }

    /**
     * Create an iterator for the tab bars in the layout tree.
     */
    *iterTabBars(): IterableIterator<TabBar<Widget>> {
      yield this.tabBar;
    }

    /**
     * Create an iterator for the handles in the layout tree.
     */

    *iterHandles(): IterableIterator<HTMLDivElement> {
      return;
    }

    /**
     * Find the tab layout node which contains the given widget.
     */
    findTabNode(widget: Widget): TabLayoutNode | null {
      return this.tabBar.titles.indexOf(widget.title) !== -1 ? this : null;
    }

    /**
     * Find the split layout node which contains the given handle.
     */
    findSplitNode(
      handle: HTMLDivElement,
    ): { index: number; node: SplitLayoutNode } | null {
      return null;
    }

    /**
     * Find the first tab layout node in a layout tree.
     */
    findFirstTabNode(): TabLayoutNode | null {
      return this;
    }

    /**
     * Find the tab layout node which contains the local point.
     */
    hitTestTabNodes(x: number, y: number): TabLayoutNode | null {
      if (x < this._left || x >= this._left + this._width) {
        return null;
      }
      if (y < this._top || y >= this._top + this._height) {
        return null;
      }
      return this;
    }

    /**
     * Create a configuration object for the layout tree.
     */
    createConfig(): DockLayout.ITabAreaConfig {
      const widgets = this.tabBar.titles.map(title => title.owner);
      const { currentIndex } = this.tabBar;
      return { type: 'tab-area', widgets, currentIndex };
    }

    /**
     * Recursively hold all of the sizes in the layout tree.
     *
     * This ignores the sizers of tab layout nodes.
     */
    holdAllSizes(): void {
      return;
    }

    /**
     * Fit the layout tree.
     */
    fit(spacing: number, items: ItemMap): ElementExt.ISizeLimits {
      // Set up the limit variables.
      let minWidth = 0;
      let minHeight = 0;
      const maxWidth = Infinity;
      const maxHeight = Infinity;

      // Lookup the tab bar layout item.
      const tabBarItem = items.get(this.tabBar);

      // Lookup the widget layout item.
      const current = this.tabBar.currentTitle;
      const widgetItem = current ? items.get(current.owner) : undefined;

      // Lookup the tab bar and widget sizers.
      const [tabBarSizer, widgetSizer] = this.sizers;

      // Update the tab bar limits.
      if (tabBarItem) {
        tabBarItem.fit();
      }

      // Update the widget limits.
      if (widgetItem) {
        widgetItem.fit();
      }

      // Update the results and sizer for the tab bar.
      if (tabBarItem && !tabBarItem.isHidden) {
        minWidth = Math.max(minWidth, tabBarItem.minWidth);
        minHeight += tabBarItem.minHeight;
        tabBarSizer.minSize = tabBarItem.minHeight;
        tabBarSizer.maxSize = tabBarItem.maxHeight;
      } else {
        tabBarSizer.minSize = 0;
        tabBarSizer.maxSize = 0;
      }

      // Update the results and sizer for the current widget.
      if (widgetItem && !widgetItem.isHidden) {
        minWidth = Math.max(minWidth, widgetItem.minWidth);
        minHeight += widgetItem.minHeight;
        widgetSizer.minSize = widgetItem.minHeight;
        widgetSizer.maxSize = Infinity;
      } else {
        widgetSizer.minSize = 0;
        widgetSizer.maxSize = Infinity;
      }

      // Return the computed size limits for the layout node.
      return { minWidth, minHeight, maxWidth, maxHeight };
    }

    /**
     * Update the layout tree.
     */
    update(
      left: number,
      top: number,
      width: number,
      height: number,
      spacing: number,
      items: ItemMap,
    ): void {
      // Update the layout box values.
      this._top = top;
      this._left = left;
      this._width = width;
      this._height = height;

      // Lookup the tab bar layout item.
      const tabBarItem = items.get(this.tabBar);

      // Lookup the widget layout item.
      const current = this.tabBar.currentTitle;
      const widgetItem = current ? items.get(current.owner) : undefined;

      // Distribute the layout space to the sizers.
      BoxEngine.calc(this.sizers, height);

      // Update the tab bar item using the computed size.
      if (tabBarItem && !tabBarItem.isHidden) {
        const { size } = this.sizers[0];
        tabBarItem.update(left, top, width, size);
        top += size;
      }

      // Layout the widget using the computed size.
      if (widgetItem && !widgetItem.isHidden) {
        const { size } = this.sizers[1];
        widgetItem.update(left, top, width, size);
      }
    }

    private _top = 0;

    private _left = 0;

    private _width = 0;

    private _height = 0;
  }

  /**
   * A layout node which holds the data for a split area.
   */
  export class SplitLayoutNode {
    /**
     * Construct a new split layout node.
     *
     * @param orientation - The orientation of the node.
     */
    constructor(orientation: Orientation) {
      this.orientation = orientation;
    }

    /**
     * The parent of the layout node.
     */
    parent: SplitLayoutNode | null = null;

    /**
     * Whether the sizers have been normalized.
     */
    normalized = false;

    /**
     * The orientation of the node.
     */
    readonly orientation: Orientation;

    /**
     * The child nodes for the split node.
     */
    readonly children: LayoutNode[] = [];

    /**
     * The box sizers for the layout children.
     */
    readonly sizers: BoxSizer[] = [];

    /**
     * The handles for the layout children.
     */
    readonly handles: HTMLDivElement[] = [];

    /**
     * Create an iterator for all widgets in the layout tree.
     */
    *iterAllWidgets(): IterableIterator<Widget> {
      for (const child of this.children) {
        yield* child.iterAllWidgets();
      }
    }

    /**
     * Create an iterator for the user widgets in the layout tree.
     */
    *iterUserWidgets(): IterableIterator<Widget> {
      for (const child of this.children) {
        yield* child.iterUserWidgets();
      }
    }

    /**
     * Create an iterator for the selected widgets in the layout tree.
     */
    *iterSelectedWidgets(): IterableIterator<Widget> {
      for (const child of this.children) {
        yield* child.iterSelectedWidgets();
      }
    }

    /**
     * Create an iterator for the tab bars in the layout tree.
     */
    *iterTabBars(): IterableIterator<TabBar<Widget>> {
      for (const child of this.children) {
        yield* child.iterTabBars();
      }
    }

    /**
     * Create an iterator for the handles in the layout tree.
     */
    *iterHandles(): IterableIterator<HTMLDivElement> {
      yield* this.handles;
      for (const child of this.children) {
        yield* child.iterHandles();
      }
    }

    /**
     * Find the tab layout node which contains the given widget.
     */
    findTabNode(widget: Widget): TabLayoutNode | null {
      for (let i = 0, n = this.children.length; i < n; ++i) {
        const result = this.children[i].findTabNode(widget);
        if (result) {
          return result;
        }
      }
      return null;
    }

    /**
     * Find the split layout node which contains the given handle.
     */
    findSplitNode(
      handle: HTMLDivElement,
    ): { index: number; node: SplitLayoutNode } | null {
      const index = this.handles.indexOf(handle);
      if (index !== -1) {
        return { index, node: this };
      }
      for (let i = 0, n = this.children.length; i < n; ++i) {
        const result = this.children[i].findSplitNode(handle);
        if (result) {
          return result;
        }
      }
      return null;
    }

    /**
     * Find the first tab layout node in a layout tree.
     */
    findFirstTabNode(): TabLayoutNode | null {
      if (this.children.length === 0) {
        return null;
      }
      return this.children[0].findFirstTabNode();
    }

    /**
     * Find the tab layout node which contains the local point.
     */
    hitTestTabNodes(x: number, y: number): TabLayoutNode | null {
      for (let i = 0, n = this.children.length; i < n; ++i) {
        const result = this.children[i].hitTestTabNodes(x, y);
        if (result) {
          return result;
        }
      }
      return null;
    }

    /**
     * Create a configuration object for the layout tree.
     */
    createConfig(): DockLayout.ISplitAreaConfig {
      const { orientation } = this;
      const sizes = this.createNormalizedSizes();
      const children = this.children.map(child => child.createConfig());
      return { type: 'split-area', orientation, children, sizes };
    }

    /**
     * Sync the visibility and orientation of the handles.
     */
    syncHandles(): void {
      this.handles.forEach((handle, i) => {
        handle.setAttribute('data-orientation', this.orientation);
        if (i === this.handles.length - 1) {
          handle.classList.add('lm-mod-hidden');
        } else {
          handle.classList.remove('lm-mod-hidden');
        }
      });
    }

    /**
     * Hold the current sizes of the box sizers.
     *
     * This sets the size hint of each sizer to its current size.
     */
    holdSizes(): void {
      for (const sizer of this.sizers) {
        sizer.sizeHint = sizer.size;
      }
    }

    /**
     * Recursively hold all of the sizes in the layout tree.
     *
     * This ignores the sizers of tab layout nodes.
     */
    holdAllSizes(): void {
      for (const child of this.children) {
        child.holdAllSizes();
      }
      this.holdSizes();
    }

    /**
     * Normalize the sizes of the split layout node.
     */
    normalizeSizes(): void {
      // Bail early if the sizers are empty.
      const n = this.sizers.length;
      if (n === 0) {
        return;
      }

      // Hold the current sizes of the sizers.
      this.holdSizes();

      // Compute the sum of the sizes.
      const sum = this.sizers.reduce((v, sizer) => v + sizer.sizeHint, 0);

      // Normalize the sizes based on the sum.
      if (sum === 0) {
        for (const sizer of this.sizers) {
          sizer.size = sizer.sizeHint = 1 / n;
        }
      } else {
        for (const sizer of this.sizers) {
          sizer.size = sizer.sizeHint /= sum;
        }
      }

      // Mark the sizes as normalized.
      this.normalized = true;
    }

    /**
     * Snap the normalized sizes of the split layout node.
     */
    createNormalizedSizes(): number[] {
      // Bail early if the sizers are empty.
      const n = this.sizers.length;
      if (n === 0) {
        return [];
      }

      // Grab the current sizes of the sizers.
      const sizes = this.sizers.map(sizer => sizer.size);

      // Compute the sum of the sizes.
      const sum = sizes.reduce((v, size) => v + size, 0);

      // Normalize the sizes based on the sum.
      if (sum === 0) {
        for (let i = sizes.length - 1; i > -1; i--) {
          sizes[i] = 1 / n;
        }
      } else {
        for (let i = sizes.length - 1; i > -1; i--) {
          sizes[i] /= sum;
        }
      }

      // Return the normalized sizes.
      return sizes;
    }

    /**
     * Fit the layout tree.
     */
    fit(spacing: number, items: ItemMap): ElementExt.ISizeLimits {
      // Compute the required fixed space.
      const horizontal = this.orientation === 'horizontal';
      const fixed = Math.max(0, this.children.length - 1) * spacing;

      // Set up the limit variables.
      let minWidth = horizontal ? fixed : 0;
      let minHeight = horizontal ? 0 : fixed;
      const maxWidth = Infinity;
      const maxHeight = Infinity;

      // Fit the children and update the limits.
      for (let i = 0, n = this.children.length; i < n; ++i) {
        const limits = this.children[i].fit(spacing, items);
        if (horizontal) {
          minHeight = Math.max(minHeight, limits.minHeight);
          minWidth += limits.minWidth;
          this.sizers[i].minSize = limits.minWidth;
        } else {
          minWidth = Math.max(minWidth, limits.minWidth);
          minHeight += limits.minHeight;
          this.sizers[i].minSize = limits.minHeight;
        }
      }

      // Return the computed limits for the layout node.
      return { minWidth, minHeight, maxWidth, maxHeight };
    }

    /**
     * Update the layout tree.
     */
    update(
      left: number,
      top: number,
      width: number,
      height: number,
      spacing: number,
      items: ItemMap,
    ): void {
      // Compute the available layout space.
      const horizontal = this.orientation === 'horizontal';
      const fixed = Math.max(0, this.children.length - 1) * spacing;
      const space = Math.max(0, (horizontal ? width : height) - fixed);

      // De-normalize the sizes if needed.
      if (this.normalized) {
        for (const sizer of this.sizers) {
          sizer.sizeHint *= space;
        }
        this.normalized = false;
      }

      // Distribute the layout space to the sizers.
      BoxEngine.calc(this.sizers, space);

      // Update the geometry of the child nodes and handles.
      for (let i = 0, n = this.children.length; i < n; ++i) {
        const child = this.children[i];
        const { size } = this.sizers[i];
        const handleStyle = this.handles[i].style;
        if (horizontal) {
          child.update(left, top, size, height, spacing, items);
          left += size;
          handleStyle.top = `${top}px`;
          handleStyle.left = `${left}px`;
          handleStyle.width = `${spacing}px`;
          handleStyle.height = `${height}px`;
          left += spacing;
        } else {
          child.update(left, top, width, size, spacing, items);
          top += size;
          handleStyle.top = `${top}px`;
          handleStyle.left = `${left}px`;
          handleStyle.width = `${width}px`;
          handleStyle.height = `${spacing}px`;
          top += spacing;
        }
      }
    }
  }

  export function addAria(widget: Widget, tabBar: TabBar<Widget>): void {
    widget.node.setAttribute('role', 'tabpanel');
    const { renderer } = tabBar;
    if (renderer instanceof TabBar.Renderer) {
      const tabId = renderer.createTabKey({
        title: widget.title,
        current: false,
        zIndex: 0,
      });
      widget.node.setAttribute('aria-labelledby', tabId);
    }
  }

  export function removeAria(widget: Widget): void {
    widget.node.removeAttribute('role');
    widget.node.removeAttribute('aria-labelledby');
  }

  /**
   * Normalize a tab area config and collect the visited widgets.
   */
  function normalizeTabAreaConfig(
    config: DockLayout.ITabAreaConfig,
    widgetSet: Set<Widget>,
  ): DockLayout.ITabAreaConfig | null {
    // Bail early if there is no content.
    if (config.widgets.length === 0) {
      return null;
    }

    // Setup the filtered widgets array.
    const widgets: Widget[] = [];

    // Filter the config for unique widgets.
    for (const widget of config.widgets) {
      if (!widgetSet.has(widget)) {
        widgetSet.add(widget);
        widgets.push(widget);
      }
    }

    // Bail if there are no effective widgets.
    if (widgets.length === 0) {
      return null;
    }

    // Normalize the current index.
    let index = config.currentIndex;
    if (index !== -1 && (index < 0 || index >= widgets.length)) {
      index = 0;
    }

    // Return a normalized config object.
    return { type: 'tab-area', widgets, currentIndex: index };
  }

  /**
   * Normalize a split area config and collect the visited widgets.
   */
  function normalizeSplitAreaConfig(
    config: DockLayout.ISplitAreaConfig,
    widgetSet: Set<Widget>,
  ): DockLayout.AreaConfig | null {
    // Set up the result variables.
    const { orientation } = config;
    const children: DockLayout.AreaConfig[] = [];
    const sizes: number[] = [];

    // Normalize the config children.
    for (let i = 0, n = config.children.length; i < n; ++i) {
      // Normalize the child config.
      const child = normalizeAreaConfig(config.children[i], widgetSet);

      // Ignore an empty child.
      if (!child) {
        continue;
      }

      // Add the child or hoist its content as appropriate.
      if (child.type === 'tab-area' || child.orientation !== orientation) {
        children.push(child);
        sizes.push(Math.abs(config.sizes[i] || 0));
      } else {
        children.push(...child.children);
        sizes.push(...child.sizes);
      }
    }

    // Bail if there are no effective children.
    if (children.length === 0) {
      return null;
    }

    // If there is only one effective child, return that child.
    if (children.length === 1) {
      return children[0];
    }

    // Return a normalized config object.
    return { type: 'split-area', orientation, children, sizes };
  }

  /**
   * Convert a normalized tab area config into a layout tree.
   */
  function realizeTabAreaConfig(
    config: DockLayout.ITabAreaConfig,
    renderer: DockLayout.IRenderer,
    document: Document | ShadowRoot,
  ): TabLayoutNode {
    // Create the tab bar for the layout node.
    const tabBar = renderer.createTabBar(document);

    // Hide each widget and add it to the tab bar.
    for (const widget of config.widgets) {
      widget.hide();
      tabBar.addTab(widget.title);
      Private.addAria(widget, tabBar);
    }

    // Set the current index of the tab bar.
    tabBar.currentIndex = config.currentIndex;

    // Return the new tab layout node.
    return new TabLayoutNode(tabBar);
  }

  /**
   * Convert a normalized split area config into a layout tree.
   */
  function realizeSplitAreaConfig(
    config: DockLayout.ISplitAreaConfig,
    renderer: DockLayout.IRenderer,
    document: Document | ShadowRoot,
  ): SplitLayoutNode {
    // Create the split layout node.
    const node = new SplitLayoutNode(config.orientation);

    // Add each child to the layout node.
    config.children.forEach((child, i) => {
      // Create the child data for the layout node.
      const childNode = realizeAreaConfig(child, renderer, document);
      const sizer = createSizer(config.sizes[i]);
      const handle = renderer.createHandle();

      // Add the child data to the layout node.
      node.children.push(childNode);
      node.handles.push(handle);
      node.sizers.push(sizer);

      // Update the parent for the child node.
      childNode.parent = node;
    });

    // Synchronize the handle state for the layout node.
    node.syncHandles();

    // Normalize the sizes for the layout node.
    node.normalizeSizes();

    // Return the new layout node.
    return node;
  }
}
