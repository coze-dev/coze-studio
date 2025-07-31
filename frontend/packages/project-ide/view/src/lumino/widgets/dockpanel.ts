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
import { type ISignal, Signal } from '../signaling';
import { AttachedProperty } from '../properties';
import { ConflatableMessage, type Message, MessageLoop } from '../messaging';
import { Drag } from '../dragdrop';
import { ElementExt, Platform } from '../domutils';
import { type IDisposable } from '../disposable';
import { MimeData } from '../coreutils';
import { find } from '../algorithm';
import { type SplitOptions } from '../../types/view';
import { Widget } from './widget';
import { TabBar } from './tabbar';
import { DockLayout } from './docklayout';

/**
 * A widget which provides a flexible docking area for widgets.
 */
export class DockPanel extends Widget {
  /**
   * Construct a new dock panel.
   *
   * @param options - The options for initializing the panel.
   */
  constructor(options: DockPanel.IOptions = {}) {
    super();
    this.addClass('lm-DockPanel');
    this._document = options.document || document;
    this._splitOptions = options.splitOptions;
    this._mode = options.mode || 'multiple-document';
    this._renderer = options.renderer || DockPanel.defaultRenderer;
    this._edges = options.edges || Private.DEFAULT_EDGES;
    if (options.tabsMovable !== undefined) {
      this._tabsMovable = options.tabsMovable;
    }
    if (options.tabsConstrained !== undefined) {
      this._tabsConstrained = options.tabsConstrained;
    }
    if (options.addButtonEnabled !== undefined) {
      this._addButtonEnabled = options.addButtonEnabled;
    }

    // Toggle the CSS mode attribute.
    this.dataset.mode = this._mode;

    // Create the delegate renderer for the layout.
    const renderer: DockPanel.IRenderer = {
      createTabBar: () => this._createTabBar(),
      createHandle: () => this._createHandle(),
    };

    // Set up the dock layout for the panel.
    this.layout = new DockLayout({
      document: this._document,
      renderer,
      spacing: options.spacing,
      hiddenMode: options.hiddenMode,
    });

    // Set up the overlay drop indicator.
    this.overlay = options.overlay || new DockPanel.Overlay();
    this.node.appendChild(this.overlay.node);
  }

  /**
   * Dispose of the resources held by the panel.
   */
  dispose(): void {
    // Ensure the mouse is released.
    this._releaseMouse();

    // Hide the overlay.
    this.overlay.hide(0);

    // Cancel a drag if one is in progress.
    if (this._drag) {
      this._drag.dispose();
    }

    // Dispose of the base class.
    super.dispose();
  }

  /**
   * The method for hiding widgets.
   */
  get hiddenMode(): Widget.HiddenMode {
    return (this.layout as DockLayout).hiddenMode;
  }

  /**
   * Set the method for hiding widgets.
   */
  set hiddenMode(v: Widget.HiddenMode) {
    (this.layout as DockLayout).hiddenMode = v;
  }

  /**
   * A signal emitted when the layout configuration is modified.
   *
   * #### Notes
   * This signal is emitted whenever the current layout configuration
   * may have changed.
   *
   * This signal is emitted asynchronously in a collapsed fashion, so
   * that multiple synchronous modifications results in only a single
   * emit of the signal.
   */
  get layoutModified(): ISignal<this, void> {
    return this._layoutModified;
  }

  /**
   * A signal emitted when the add button on a tab bar is clicked.
   *
   */
  get addRequested(): ISignal<this, TabBar<Widget>> {
    return this._addRequested;
  }

  /**
   * The overlay used by the dock panel.
   */
  readonly overlay: DockPanel.IOverlay;

  /**
   * The renderer used by the dock panel.
   */
  get renderer(): DockPanel.IRenderer {
    return (this.layout as DockLayout).renderer;
  }

  /**
   * Get the spacing between the widgets.
   */
  get spacing(): number {
    return (this.layout as DockLayout).spacing;
  }

  /**
   * Set the spacing between the widgets.
   */
  set spacing(value: number) {
    (this.layout as DockLayout).spacing = value;
  }

  /**
   * Get the mode for the dock panel.
   */
  get mode(): DockPanel.Mode {
    return this._mode;
  }

  /**
   * Set the mode for the dock panel.
   *
   * #### Notes
   * Changing the mode is a destructive operation with respect to the
   * panel's layout configuration. If layout state must be preserved,
   * save the current layout config before changing the mode.
   */
  set mode(value: DockPanel.Mode) {
    // Bail early if the mode does not change.
    if (this._mode === value) {
      return;
    }

    // Update the internal mode.
    this._mode = value;

    // Toggle the CSS mode attribute.
    this.dataset.mode = value;

    // Get the layout for the panel.
    const layout = this.layout as DockLayout;

    // Configure the layout for the specified mode.
    switch (value) {
      case 'multiple-document':
        for (const tabBar of layout.tabBars()) {
          tabBar.show();
        }
        break;
      case 'single-document':
        layout.restoreLayout(Private.createSingleDocumentConfig(this));
        break;
      default:
        throw 'unreachable';
    }

    // Schedule an emit of the layout modified signal.
    MessageLoop.postMessage(this, Private.LayoutModified);
  }

  /**
   * Whether the tabs can be dragged / moved at runtime.
   */
  get tabsMovable(): boolean {
    return this._tabsMovable;
  }

  /**
   * Enable / Disable draggable / movable tabs.
   */
  set tabsMovable(value: boolean) {
    this._tabsMovable = value;
    for (const tabBar of this.tabBars()) {
      tabBar.tabsMovable = value;
    }
  }

  /**
   * Whether the tabs are constrained to their source dock panel
   */
  get tabsConstrained(): boolean {
    return this._tabsConstrained;
  }

  /**
   * Constrain/Allow tabs to be dragged outside of this dock panel
   */
  set tabsConstrained(value: boolean) {
    this._tabsConstrained = value;
  }

  /**
   * Whether the add buttons for each tab bar are enabled.
   */
  get addButtonEnabled(): boolean {
    return this._addButtonEnabled;
  }

  /**
   * Set whether the add buttons for each tab bar are enabled.
   */
  set addButtonEnabled(value: boolean) {
    this._addButtonEnabled = value;
    for (const tabBar of this.tabBars()) {
      tabBar.addButtonEnabled = value;
    }
  }

  /**
   * Whether the dock panel is empty.
   */
  get isEmpty(): boolean {
    return (this.layout as DockLayout).isEmpty;
  }

  /**
   * Create an iterator over the user widgets in the panel.
   *
   * @returns A new iterator over the user widgets in the panel.
   *
   * #### Notes
   * This iterator does not include the generated tab bars.
   */
  *widgets(): IterableIterator<Widget> {
    yield* (this.layout as DockLayout).widgets();
  }

  /**
   * Create an iterator over the selected widgets in the panel.
   *
   * @returns A new iterator over the selected user widgets.
   *
   * #### Notes
   * This iterator yields the widgets corresponding to the current tab
   * of each tab bar in the panel.
   */
  *selectedWidgets(): IterableIterator<Widget> {
    yield* (this.layout as DockLayout).selectedWidgets();
  }

  /**
   * Create an iterator over the tab bars in the panel.
   *
   * @returns A new iterator over the tab bars in the panel.
   *
   * #### Notes
   * This iterator does not include the user widgets.
   */
  *tabBars(): IterableIterator<TabBar<Widget>> {
    yield* (this.layout as DockLayout).tabBars();
  }

  /**
   * Create an iterator over the handles in the panel.
   *
   * @returns A new iterator over the handles in the panel.
   */
  *handles(): IterableIterator<HTMLDivElement> {
    yield* (this.layout as DockLayout).handles();
  }

  /**
   * Select a specific widget in the dock panel.
   *
   * @param widget - The widget of interest.
   *
   * #### Notes
   * This will make the widget the current widget in its tab area.
   */
  selectWidget(widget: Widget): void {
    // Find the tab bar which contains the widget.
    const tabBar = find(
      this.tabBars(),
      bar => bar.titles.indexOf(widget.title) !== -1,
    );

    // Throw an error if no tab bar is found.
    if (!tabBar) {
      throw new Error('Widget is not contained in the dock panel.');
    }

    // Ensure the widget is the current widget.
    tabBar.currentTitle = widget.title;
  }

  /**
   * Activate a specified widget in the dock panel.
   *
   * @param widget - The widget of interest.
   *
   * #### Notes
   * This will select and activate the given widget.
   */
  activateWidget(widget: Widget): void {
    this.selectWidget(widget);
    widget.activate();
  }

  /**
   * Save the current layout configuration of the dock panel.
   *
   * @returns A new config object for the current layout state.
   *
   * #### Notes
   * The return value can be provided to the `restoreLayout` method
   * in order to restore the layout to its current configuration.
   */
  saveLayout(): DockPanel.ILayoutConfig {
    return (this.layout as DockLayout).saveLayout();
  }

  /**
   * Restore the layout to a previously saved configuration.
   *
   * @param config - The layout configuration to restore.
   *
   * #### Notes
   * Widgets which currently belong to the layout but which are not
   * contained in the config will be unparented.
   *
   * The dock panel automatically reverts to `'multiple-document'`
   * mode when a layout config is restored.
   */
  restoreLayout(config: DockPanel.ILayoutConfig): void {
    // Reset the mode.
    this._mode = 'multiple-document';

    // Restore the layout.
    (this.layout as DockLayout).restoreLayout(config);

    // Flush the message loop on IE and Edge to prevent flicker.
    if (Platform.IS_EDGE || Platform.IS_IE) {
      MessageLoop.flush();
    }

    // Schedule an emit of the layout modified signal.
    MessageLoop.postMessage(this, Private.LayoutModified);
  }

  /**
   * Add a widget to the dock panel.
   *
   * @param widget - The widget to add to the dock panel.
   *
   * @param options - The additional options for adding the widget.
   *
   * #### Notes
   * If the panel is in single document mode, the options are ignored
   * and the widget is always added as tab in the hidden tab bar.
   */
  addWidget(widget: Widget, options: DockPanel.IAddOptions = {}): void {
    // Add the widget to the layout.
    if (this._mode === 'single-document') {
      (this.layout as DockLayout).addWidget(widget);
    } else {
      (this.layout as DockLayout).addWidget(widget, options);
    }

    // Schedule an emit of the layout modified signal.
    MessageLoop.postMessage(this, Private.LayoutModified);
  }

  /**
   * Process a message sent to the widget.
   *
   * @param msg - The message sent to the widget.
   */
  processMessage(msg: Message): void {
    if (msg.type === 'layout-modified') {
      this._layoutModified.emit(undefined);
    } else {
      super.processMessage(msg);
    }
  }

  /**
   * Handle the DOM events for the dock panel.
   *
   * @param event - The DOM event sent to the panel.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the panel's DOM node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'lm-dragenter':
        this._evtDragEnter(event as Drag.Event);
        break;
      case 'lm-dragleave':
        this._evtDragLeave(event as Drag.Event);
        break;
      case 'lm-dragover':
        this._evtDragOver(event as Drag.Event);
        break;
      case 'lm-drop':
        this._evtDrop(event as Drag.Event);
        break;
      case 'pointerdown':
        this._evtPointerDown(event as PointerEvent);
        break;
      case 'pointermove':
        this._evtPointerMove(event as PointerEvent);
        break;
      case 'pointerup':
        this._evtPointerUp(event as PointerEvent);
        break;
      case 'keydown':
        this._evtKeyDown(event as KeyboardEvent);
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
    this.node.addEventListener('lm-dragenter', this);
    this.node.addEventListener('lm-dragleave', this);
    this.node.addEventListener('lm-dragover', this);
    this.node.addEventListener('lm-drop', this);
    this.node.addEventListener('pointerdown', this);
  }

  /**
   * A message handler invoked on an `'after-detach'` message.
   */
  protected onAfterDetach(msg: Message): void {
    this.node.removeEventListener('lm-dragenter', this);
    this.node.removeEventListener('lm-dragleave', this);
    this.node.removeEventListener('lm-dragover', this);
    this.node.removeEventListener('lm-drop', this);
    this.node.removeEventListener('pointerdown', this);
    this._releaseMouse();
  }

  /**
   * A message handler invoked on a `'child-added'` message.
   */
  protected onChildAdded(msg: Widget.ChildMessage): void {
    // Ignore the generated tab bars.
    if (Private.isGeneratedTabBarProperty.get(msg.child)) {
      return;
    }

    // Add the widget class to the child.
    msg.child.addClass('lm-DockPanel-widget');
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   */
  protected onChildRemoved(msg: Widget.ChildMessage): void {
    // Ignore the generated tab bars.
    if (Private.isGeneratedTabBarProperty.get(msg.child)) {
      return;
    }

    // Remove the widget class from the child.
    msg.child.removeClass('lm-DockPanel-widget');

    // Schedule an emit of the layout modified signal.
    MessageLoop.postMessage(this, Private.LayoutModified);
  }

  /**
   * Handle the `'lm-dragenter'` event for the dock panel.
   */
  private _evtDragEnter(event: Drag.Event): void {
    // If the factory mime type is present, mark the event as
    // handled in order to get the rest of the drag events.
    if (event.mimeData.hasData('application/vnd.lumino.widget-factory')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Handle the `'lm-dragleave'` event for the dock panel.
   */
  private _evtDragLeave(event: Drag.Event): void {
    // Mark the event as handled.
    event.preventDefault();

    if (this._tabsConstrained && event.source !== this) {
      return;
    }

    event.stopPropagation();

    // The new target might be a descendant, so we might still handle the drop.
    // Hide asynchronously so that if a lm-dragover event bubbles up to us, the
    // hide is cancelled by the lm-dragover handler's show overlay logic.
    this.overlay.hide(1);
  }

  /**
   * Handle the `'lm-dragover'` event for the dock panel.
   */
  private _evtDragOver(event: Drag.Event): void {
    // Mark the event as handled.
    event.preventDefault();

    // Show the drop indicator overlay and update the drop
    // action based on the drop target zone under the mouse.
    if (
      (this._tabsConstrained && event.source !== this) ||
      this._showOverlay(event.clientX, event.clientY) === 'invalid'
    ) {
      event.dropAction = 'none';
    } else {
      event.stopPropagation();
      event.dropAction = event.proposedAction;
    }
  }

  /**
   * Handle the `'lm-drop'` event for the dock panel.
   */
  private async _evtDrop(event: Drag.Event): Promise<void> {
    // Mark the event as handled.
    event.preventDefault();

    // Hide the drop indicator overlay.
    this.overlay.hide(0);

    // Bail if the proposed action is to do nothing.
    if (event.proposedAction === 'none') {
      event.dropAction = 'none';
      return;
    }

    // Find the drop target under the mouse.
    const { clientX, clientY } = event;
    const { zone, target } = Private.findDropTarget(
      this,
      clientX,
      clientY,
      this._edges,
      this._splitOptions,
    );

    // Bail if the drop zone is invalid.
    if (
      (this._tabsConstrained && event.source !== this) ||
      zone === 'invalid'
    ) {
      event.dropAction = 'none';
      return;
    }

    // Bail if the factory mime type has invalid data.
    const { mimeData } = event;
    const factory = mimeData.getData('application/vnd.lumino.widget-factory');
    if (typeof factory !== 'function') {
      event.dropAction = 'none';
      return;
    }

    // Bail if the factory does not produce a widget.
    const widgets = await factory();
    let replaceRef: Widget;
    widgets.forEach((widget: Widget, idx: number) => {
      // The first one executes the split screen, and the follow-up is widget-all.
      if (idx === 0) {
        this.bindWidget(event, widget, zone, target);
        replaceRef = widget;
      } else {
        this.bindWidget(event, widget, 'widget-all', target, replaceRef);
      }
    });
  }

  private bindWidget(
    event: Drag.Event,
    widget: Widget,
    zone: Private.DropZone,
    target: DockLayout.ITabAreaGeometry | null,
    replaceRef?: Widget,
  ) {
    if (!(widget instanceof Widget)) {
      event.dropAction = 'none';
      return;
    }

    // Bail if the widget is an ancestor of the dock panel.
    if (widget.contains(this)) {
      event.dropAction = 'none';
      return;
    }
    // Find the reference widget for the drop target.
    let ref = target ? Private.getDropRef(target.tabBar) : null;

    if (replaceRef) {
      ref = replaceRef;
    }

    // Add the widget according to the indicated drop zone.
    switch (zone) {
      case 'root-all':
        this.addWidget(widget);
        break;
      case 'root-top':
        this.addWidget(widget, { mode: 'split-top' });
        break;
      case 'root-left':
        this.addWidget(widget, { mode: 'split-left' });
        break;
      case 'root-right':
        this.addWidget(widget, { mode: 'split-right' });
        break;
      case 'root-bottom':
        this.addWidget(widget, { mode: 'split-bottom' });
        break;
      case 'widget-all':
        this.addWidget(widget, { mode: 'tab-after', ref });
        break;
      case 'widget-top':
        this.addWidget(widget, { mode: 'split-top', ref });
        break;
      case 'widget-left':
        this.addWidget(widget, { mode: 'split-left', ref });
        break;
      case 'widget-right':
        this.addWidget(widget, { mode: 'split-right', ref });
        break;
      case 'widget-bottom':
        this.addWidget(widget, { mode: 'split-bottom', ref });
        break;
      case 'widget-tab':
        this.addWidget(widget, { mode: 'tab-after', ref });
        break;
      default:
        throw 'unreachable';
    }

    // Accept the proposed drop action.
    event.dropAction = event.proposedAction;

    // Stop propagation if we have not bailed so far.
    event.stopPropagation();

    // Activate the dropped widget.
    this.activateWidget(widget);
  }

  /**
   * Handle the `'keydown'` event for the dock panel.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    // Stop input events during drag.
    event.preventDefault();
    event.stopPropagation();

    // Release the mouse if `Escape` is pressed.
    if (event.keyCode === 27) {
      // Finalize the mouse release.
      this._releaseMouse();

      // Schedule an emit of the layout modified signal.
      MessageLoop.postMessage(this, Private.LayoutModified);
    }
  }

  /**
   * Handle the `'pointerdown'` event for the dock panel.
   */
  private _evtPointerDown(event: PointerEvent): void {
    // Do nothing if the left mouse button is not pressed.
    if (event.button !== 0) {
      return;
    }

    // Find the handle which contains the mouse target, if any.
    const layout = this.layout as DockLayout;
    const target = event.target as HTMLElement;
    const handle = find(layout.handles(), handle => handle.contains(target));
    if (!handle) {
      return;
    }

    // Stop the event when a handle is pressed.
    event.preventDefault();
    event.stopPropagation();

    // Add the extra document listeners.
    this._document.addEventListener('keydown', this, true);
    this._document.addEventListener('pointerup', this, true);
    this._document.addEventListener('pointermove', this, true);
    this._document.addEventListener('contextmenu', this, true);

    // Compute the offset deltas for the handle press.
    const rect = handle.getBoundingClientRect();
    const deltaX = event.clientX - rect.left;
    const deltaY = event.clientY - rect.top;

    // Override the cursor and store the press data.
    const style = window.getComputedStyle(handle);
    const override = Drag.overrideCursor(style.cursor!, this._document);
    this._pressData = { handle, deltaX, deltaY, override };
  }

  /**
   * Handle the `'pointermove'` event for the dock panel.
   */
  private _evtPointerMove(event: PointerEvent): void {
    // Bail early if no drag is in progress.
    if (!this._pressData) {
      return;
    }

    // Stop the event when dragging a handle.
    event.preventDefault();
    event.stopPropagation();

    // Compute the desired offset position for the handle.
    const rect = this.node.getBoundingClientRect();
    const xPos = event.clientX - rect.left - this._pressData.deltaX;
    const yPos = event.clientY - rect.top - this._pressData.deltaY;

    // Set the handle as close to the desired position as possible.
    const layout = this.layout as DockLayout;
    layout.moveHandle(this._pressData.handle, xPos, yPos);
  }

  /**
   * Handle the `'pointerup'` event for the dock panel.
   */
  private _evtPointerUp(event: PointerEvent): void {
    // Do nothing if the left mouse button is not released.
    if (event.button !== 0) {
      return;
    }

    // Stop the event when releasing a handle.
    event.preventDefault();
    event.stopPropagation();

    // Finalize the mouse release.
    this._releaseMouse();

    // Schedule an emit of the layout modified signal.
    MessageLoop.postMessage(this, Private.LayoutModified);
  }

  /**
   * Release the mouse grab for the dock panel.
   */
  private _releaseMouse(): void {
    // Bail early if no drag is in progress.
    if (!this._pressData) {
      return;
    }

    // Clear the override cursor.
    this._pressData.override.dispose();
    this._pressData = null;

    // Remove the extra document listeners.
    this._document.removeEventListener('keydown', this, true);
    this._document.removeEventListener('pointerup', this, true);
    this._document.removeEventListener('pointermove', this, true);
    this._document.removeEventListener('contextmenu', this, true);
  }

  /**
   * Show the overlay indicator at the given client position.
   *
   * Returns the drop zone at the specified client position.
   *
   * #### Notes
   * If the position is not over a valid zone, the overlay is hidden.
   */
  private _showOverlay(clientX: number, clientY: number): Private.DropZone {
    // Find the dock target for the given client position.
    const { zone, target } = Private.findDropTarget(
      this,
      clientX,
      clientY,
      this._edges,
      this._splitOptions,
    );

    // If the drop zone is invalid, hide the overlay and bail.
    if (zone === 'invalid') {
      this.overlay.hide(100);
      return zone;
    }

    // Setup the variables needed to compute the overlay geometry.
    let top: number;
    let left: number;
    let right: number;
    let bottom: number;
    const box = ElementExt.boxSizing(this.node); // TODO cache this?
    const rect = this.node.getBoundingClientRect();

    // Compute the overlay geometry based on the dock zone.
    switch (zone) {
      case 'root-all':
        top = box.paddingTop;
        left = box.paddingLeft;
        right = box.paddingRight;
        bottom = box.paddingBottom;
        break;
      case 'root-top':
        top = box.paddingTop;
        left = box.paddingLeft;
        right = box.paddingRight;
        bottom = rect.height * Private.GOLDEN_RATIO;
        break;
      case 'root-left':
        top = box.paddingTop;
        left = box.paddingLeft;
        right = rect.width * Private.GOLDEN_RATIO;
        bottom = box.paddingBottom;
        break;
      case 'root-right':
        top = box.paddingTop;
        left = rect.width * Private.GOLDEN_RATIO;
        right = box.paddingRight;
        bottom = box.paddingBottom;
        break;
      case 'root-bottom':
        top = rect.height * Private.GOLDEN_RATIO;
        left = box.paddingLeft;
        right = box.paddingRight;
        bottom = box.paddingBottom;
        break;
      case 'widget-all':
        top = target!.top;
        left = target!.left;
        right = target!.right;
        bottom = target!.bottom;
        break;
      case 'widget-top':
        top = target!.top;
        left = target!.left;
        right = target!.right;
        bottom = target!.bottom + target!.height / 2;
        break;
      case 'widget-left':
        top = target!.top;
        left = target!.left;
        right = target!.right + target!.width / 2;
        bottom = target!.bottom;
        break;
      case 'widget-right':
        top = target!.top;
        left = target!.left + target!.width / 2;
        right = target!.right;
        bottom = target!.bottom;
        break;
      case 'widget-bottom':
        top = target!.top + target!.height / 2;
        left = target!.left;
        right = target!.right;
        bottom = target!.bottom;
        break;
      case 'widget-tab': {
        const tabHeight = target!.tabBar.node.getBoundingClientRect().height;
        top = target!.top;
        left = target!.left;
        right = target!.right;
        bottom = target!.bottom + target!.height - tabHeight;
        break;
      }
      default:
        throw 'unreachable';
    }

    // Show the overlay with the computed geometry.
    this.overlay.show({ top, left, right, bottom });

    // Finally, return the computed drop zone.
    return zone;
  }

  /**
   * Create a new tab bar for use by the panel.
   */
  private _createTabBar(): TabBar<Widget> {
    // Create the tab bar.
    const tabBar = this._renderer.createTabBar(this._document);

    // Set the generated tab bar property for the tab bar.
    Private.isGeneratedTabBarProperty.set(tabBar, true);

    // Hide the tab bar when in single document mode.
    if (this._mode === 'single-document') {
      tabBar.hide();
    }

    // Enforce necessary tab bar behavior.
    // TODO do we really want to enforce *all* of these?
    tabBar.tabsMovable = this._tabsMovable;
    tabBar.allowDeselect = false;
    tabBar.addButtonEnabled = this._addButtonEnabled;
    tabBar.removeBehavior = 'select-previous-tab';
    tabBar.insertBehavior = 'select-tab-if-needed';

    // Connect the signal handlers for the tab bar.
    tabBar.tabMoved.connect(this._onTabMoved, this);
    tabBar.currentChanged.connect(this._onCurrentChanged, this);
    tabBar.tabCloseRequested.connect(this._onTabCloseRequested, this);
    tabBar.tabDetachRequested.connect(this._onTabDetachRequested, this);
    tabBar.tabActivateRequested.connect(this._onTabActivateRequested, this);
    tabBar.addRequested.connect(this._onTabAddRequested, this);

    // Return the initialized tab bar.
    return tabBar;
  }

  /**
   * Create a new handle for use by the panel.
   */
  private _createHandle(): HTMLDivElement {
    return this._renderer.createHandle();
  }

  /**
   * Handle the `tabMoved` signal from a tab bar.
   */
  private _onTabMoved(): void {
    MessageLoop.postMessage(this, Private.LayoutModified);
  }

  /**
   * Handle the `currentChanged` signal from a tab bar.
   */
  protected _onCurrentChanged(
    sender: TabBar<Widget>,
    args: TabBar.ICurrentChangedArgs<Widget>,
  ): void {
    // Extract the previous and current title from the args.
    const { previousTitle, currentTitle } = args;

    // Hide the previous widget.
    if (previousTitle) {
      previousTitle.owner.hide();
    }

    // Show the current widget.
    if (currentTitle) {
      currentTitle.owner.show();
    }

    // Flush the message loop on IE and Edge to prevent flicker.
    if (Platform.IS_EDGE || Platform.IS_IE) {
      MessageLoop.flush();
    }

    // Schedule an emit of the layout modified signal.
    MessageLoop.postMessage(this, Private.LayoutModified);
  }

  /**
   * Handle the `addRequested` signal from a tab bar.
   */
  private _onTabAddRequested(sender: TabBar<Widget>): void {
    this._addRequested.emit(sender);
  }

  /**
   * Handle the `tabActivateRequested` signal from a tab bar.
   */
  protected _onTabActivateRequested(
    sender: TabBar<Widget>,
    args: TabBar.ITabActivateRequestedArgs<Widget>,
  ): void {
    args.title.owner.activate();
  }

  /**
   * Handle the `tabCloseRequested` signal from a tab bar.
   */
  private _onTabCloseRequested(
    sender: TabBar<Widget>,
    args: TabBar.ITabCloseRequestedArgs<Widget>,
  ): void {
    args.title.owner.close();
  }

  /**
   * Handle the `tabDetachRequested` signal from a tab bar.
   */
  private _onTabDetachRequested(
    sender: TabBar<Widget>,
    args: TabBar.ITabDetachRequestedArgs<Widget>,
  ): void {
    // Do nothing if a drag is already in progress.
    if (this._drag) {
      return;
    }

    // Release the tab bar's hold on the mouse.
    sender.releaseMouse();

    // Extract the data from the args.
    const { title, tab, clientX, clientY, offset } = args;

    // Setup the mime data for the drag operation.
    const mimeData = new MimeData();
    const factory = () => [title.owner];
    mimeData.setData('application/vnd.lumino.widget-factory', factory);

    // Create the drag image for the drag operation.
    const dragImage = tab.cloneNode(true) as HTMLElement;
    if (offset) {
      dragImage.style.top = `-${offset.y}px`;
      dragImage.style.left = `-${offset.x}px`;
    }

    // Create the drag object to manage the drag-drop operation.
    this._drag = new Drag({
      document: this._document,
      mimeData,
      dragImage,
      proposedAction: 'move',
      supportedActions: 'move',
      source: this,
    });

    // Hide the tab node in the original tab.
    tab.classList.add('lm-mod-hidden');
    const cleanup = () => {
      this._drag = null;
      tab.classList.remove('lm-mod-hidden');
    };

    // Start the drag operation and cleanup when done.
    this._drag.start(clientX, clientY).then(cleanup);
  }

  private _edges: DockPanel.IEdges;

  private _document: Document | ShadowRoot;

  private _splitOptions: SplitOptions | undefined;

  private _mode: DockPanel.Mode;

  private _drag: Drag | null = null;

  private _renderer: DockPanel.IRenderer;

  private _tabsMovable = true;

  private _tabsConstrained = false;

  private _addButtonEnabled = false;

  private _pressData: Private.IPressData | null = null;

  private _layoutModified = new Signal<this, void>(this);

  private _addRequested = new Signal<this, TabBar<Widget>>(this);
}

/**
 * The namespace for the `DockPanel` class statics.
 */
export namespace DockPanel {
  /**
   * An options object for creating a dock panel.
   */
  export interface IOptions {
    /**
     * Maximum number of split screens
     */
    splitOptions?: SplitOptions;
    /**
     * The document to use with the dock panel.
     *
     * The default is the global `document` instance.
     */

    document?: Document | ShadowRoot;
    /**
     * The overlay to use with the dock panel.
     *
     * The default is a new `Overlay` instance.
     */
    overlay?: IOverlay;

    /**
     * The renderer to use for the dock panel.
     *
     * The default is a shared renderer instance.
     */
    renderer?: IRenderer;

    /**
     * The spacing between the items in the panel.
     *
     * The default is `4`.
     */
    spacing?: number;

    /**
     * The mode for the dock panel.
     *
     * The default is `'multiple-document'`.
     */
    mode?: DockPanel.Mode;

    /**
     * The sizes of the edge drop zones, in pixels.
     * If not given, default values will be used.
     */
    edges?: IEdges;

    /**
     * The method for hiding widgets.
     *
     * The default is `Widget.HiddenMode.Display`.
     */
    hiddenMode?: Widget.HiddenMode;

    /**
     * Allow tabs to be draggable / movable by user.
     *
     * The default is `'true'`.
     */
    tabsMovable?: boolean;

    /**
     * Constrain tabs to this dock panel
     *
     * The default is `'false'`.
     */
    tabsConstrained?: boolean;

    /**
     * Enable add buttons in each of the dock panel's tab bars.
     *
     * The default is `'false'`.
     */
    addButtonEnabled?: boolean;
  }

  /**
   * The sizes of the edge drop zones, in pixels.
   */
  export interface IEdges {
    /**
     * The size of the top edge drop zone.
     */
    top: number;

    /**
     * The size of the right edge drop zone.
     */
    right: number;

    /**
     * The size of the bottom edge drop zone.
     */
    bottom: number;

    /**
     * The size of the left edge drop zone.
     */
    left: number;
  }

  /**
   * A type alias for the supported dock panel modes.
   */
  export type Mode =
    | /**
     * The single document mode.
     *
     * In this mode, only a single widget is visible at a time, and that
     * widget fills the available layout space. No tab bars are visible.
     */
    'single-document'

    /**
     * The multiple document mode.
     *
     * In this mode, multiple documents are displayed in separate tab
     * areas, and those areas can be individually resized by the user.
     */
    | 'multiple-document';

  /**
   * A type alias for a layout configuration object.
   */
  export type ILayoutConfig = DockLayout.ILayoutConfig;

  /**
   * A type alias for the supported insertion modes.
   */
  export type InsertMode = DockLayout.InsertMode;

  /**
   * A type alias for the add widget options.
   */
  export type IAddOptions = DockLayout.IAddOptions;

  /**
   * An object which holds the geometry for overlay positioning.
   */
  export interface IOverlayGeometry {
    /**
     * The distance between the overlay and parent top edges.
     */
    top: number;

    /**
     * The distance between the overlay and parent left edges.
     */
    left: number;

    /**
     * The distance between the overlay and parent right edges.
     */
    right: number;

    /**
     * The distance between the overlay and parent bottom edges.
     */
    bottom: number;
  }

  /**
   * An object which manages the overlay node for a dock panel.
   */
  export interface IOverlay {
    /**
     * The DOM node for the overlay.
     */
    readonly node: HTMLDivElement;

    /**
     * Show the overlay using the given overlay geometry.
     *
     * @param geo - The desired geometry for the overlay.
     *
     * #### Notes
     * The given geometry values assume the node will use absolute
     * positioning.
     *
     * This is called on every mouse move event during a drag in order
     * to update the position of the overlay. It should be efficient.
     */
    show(geo: IOverlayGeometry): void;

    /**
     * Hide the overlay node.
     *
     * @param delay - The delay (in ms) before hiding the overlay.
     *   A delay value <= 0 should hide the overlay immediately.
     *
     * #### Notes
     * This is called whenever the overlay node should been hidden.
     */
    hide(delay: number): void;
  }

  /**
   * A concrete implementation of `IOverlay`.
   *
   * This is the default overlay implementation for a dock panel.
   */
  export class Overlay implements IOverlay {
    /**
     * Construct a new overlay.
     */
    constructor() {
      this.node = document.createElement('div');
      this.node.classList.add('lm-DockPanel-overlay');
      this.node.classList.add('lm-mod-hidden');
      this.node.style.position = 'absolute';
      this.node.style.contain = 'strict';
    }

    /**
     * The DOM node for the overlay.
     */
    readonly node: HTMLDivElement;

    /**
     * Show the overlay using the given overlay geometry.
     *
     * @param geo - The desired geometry for the overlay.
     */
    show(geo: IOverlayGeometry): void {
      // Update the position of the overlay.
      const { style } = this.node;
      style.top = `${geo.top}px`;
      style.left = `${geo.left}px`;
      style.right = `${geo.right}px`;
      style.bottom = `${geo.bottom}px`;

      // Clear any pending hide timer.
      clearTimeout(this._timer);
      this._timer = -1;

      // If the overlay is already visible, we're done.
      if (!this._hidden) {
        return;
      }

      // Clear the hidden flag.
      this._hidden = false;

      // Finally, show the overlay.
      this.node.classList.remove('lm-mod-hidden');
    }

    /**
     * Hide the overlay node.
     *
     * @param delay - The delay (in ms) before hiding the overlay.
     *   A delay value <= 0 will hide the overlay immediately.
     */
    hide(delay: number): void {
      // Do nothing if the overlay is already hidden.
      if (this._hidden) {
        return;
      }

      // Hide immediately if the delay is <= 0.
      if (delay <= 0) {
        clearTimeout(this._timer);
        this._timer = -1;
        this._hidden = true;
        this.node.classList.add('lm-mod-hidden');
        return;
      }

      // Do nothing if a hide is already pending.
      if (this._timer !== -1) {
        return;
      }

      // Otherwise setup the hide timer.
      this._timer = window.setTimeout(() => {
        this._timer = -1;
        this._hidden = true;
        this.node.classList.add('lm-mod-hidden');
      }, delay);
    }

    private _timer = -1;

    private _hidden = true;
  }

  /**
   * A type alias for a dock panel renderer;
   */
  export type IRenderer = DockLayout.IRenderer;

  /**
   * The default implementation of `IRenderer`.
   */
  export class Renderer implements IRenderer {
    /**
     * Create a new tab bar for use with a dock panel.
     *
     * @returns A new tab bar for a dock panel.
     */
    createTabBar(document?: Document | ShadowRoot): TabBar<Widget> {
      const bar = new TabBar<Widget>({ document });
      bar.addClass('lm-DockPanel-tabBar');
      return bar;
    }

    /**
     * Create a new handle node for use with a dock panel.
     *
     * @returns A new handle node for a dock panel.
     */
    createHandle(): HTMLDivElement {
      const handle = document.createElement('div');
      handle.className = 'lm-DockPanel-handle';
      return handle;
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
   * A fraction used for sizing root panels; ~= `1 / golden_ratio`.
   */
  export const GOLDEN_RATIO = 0.618;

  /**
   * The default sizes for the edge drop zones, in pixels.
   */
  export const DEFAULT_EDGES = {
    /**
     * The size of the top edge dock zone for the root panel, in pixels.
     * This is different from the others to distinguish between the top
     * tab bar and the top root zone.
     */
    top: 12,

    /**
     * The size of the edge dock zone for the root panel, in pixels.
     */
    right: 40,

    /**
     * The size of the edge dock zone for the root panel, in pixels.
     */
    bottom: 40,

    /**
     * The size of the edge dock zone for the root panel, in pixels.
     */
    left: 40,
  };

  /**
   * A singleton `'layout-modified'` conflatable message.
   */
  export const LayoutModified = new ConflatableMessage('layout-modified');

  /**
   * An object which holds mouse press data.
   */
  export interface IPressData {
    /**
     * The handle which was pressed.
     */
    handle: HTMLDivElement;

    /**
     * The X offset of the press in handle coordinates.
     */
    deltaX: number;

    /**
     * The Y offset of the press in handle coordinates.
     */
    deltaY: number;

    /**
     * The disposable which will clear the override cursor.
     */
    override: IDisposable;
  }

  /**
   * A type alias for a drop zone.
   */
  export type DropZone =
    | /**
     * An invalid drop zone.
     */
    'invalid'

    /**
     * The entirety of the root dock area.
     */
    | 'root-all'

    /**
     * The top portion of the root dock area.
     */
    | 'root-top'

    /**
     * The left portion of the root dock area.
     */
    | 'root-left'

    /**
     * The right portion of the root dock area.
     */
    | 'root-right'

    /**
     * The bottom portion of the root dock area.
     */
    | 'root-bottom'

    /**
     * The entirety of a tabbed widget area.
     */
    | 'widget-all'

    /**
     * The top portion of tabbed widget area.
     */
    | 'widget-top'

    /**
     * The left portion of tabbed widget area.
     */
    | 'widget-left'

    /**
     * The right portion of tabbed widget area.
     */
    | 'widget-right'

    /**
     * The bottom portion of tabbed widget area.
     */
    | 'widget-bottom'

    /**
     * The the bar of a tabbed widget area.
     */
    | 'widget-tab';

  /**
   * An object which holds the drop target zone and widget.
   */
  export interface IDropTarget {
    /**
     * The semantic zone for the mouse position.
     */
    zone: DropZone;

    /**
     * The tab area geometry for the drop zone, or `null`.
     */
    target: DockLayout.ITabAreaGeometry | null;
  }

  /**
   * An attached property used to track generated tab bars.
   */
  export const isGeneratedTabBarProperty = new AttachedProperty<
    Widget,
    boolean
  >({
    name: 'isGeneratedTabBar',
    create: () => false,
  });

  /**
   * Create a single document config for the widgets in a dock panel.
   */
  export function createSingleDocumentConfig(
    panel: DockPanel,
  ): DockPanel.ILayoutConfig {
    // Return an empty config if the panel is empty.
    if (panel.isEmpty) {
      return { main: null };
    }

    // Get a flat array of the widgets in the panel.
    const widgets = Array.from(panel.widgets());

    // Get the first selected widget in the panel.
    const selected = panel.selectedWidgets().next().value;

    // Compute the current index for the new config.
    const currentIndex = selected ? widgets.indexOf(selected) : -1;

    // Return the single document config.
    return { main: { type: 'tab-area', widgets, currentIndex } };
  }

  /**
   * Recursively traverse the layout tree to count the number of tab-areas
   * @param area DockLayout.Area
   * @returns number number of split screens
   */
  function countTabAreas(area: DockLayout.AreaConfig | null): number {
    if (area?.type === 'tab-area') {
      return 1; // Find a tab area
    } else if (area?.type === 'split-area') {
      // Traverse the subregions and recursively calculate the number of each region
      return area.children.reduce(
        (count, child) => count + countTabAreas(child),
        0,
      );
    }
    return 0;
  }

  function getWidgetZoneTarget(al: number, at: number, ar: number, ab: number) {
    const alignArr = [al, at, ar, ab];
    const ad = Math.min(...alignArr);

    // Find the widget zone for the area edge.
    let zone: DropZone;
    switch (ad) {
      case al:
        zone = 'widget-left';
        break;
      case at:
        zone = 'widget-top';
        break;
      case ar:
        zone = 'widget-right';
        break;
      case ab:
        zone = 'widget-bottom';
        break;
      default:
        throw 'unreachable';
    }
    return zone;
  }

  /**
   * Find the drop target at the given client position.
   */
  export function findDropTarget(
    panel: DockPanel,
    clientX: number,
    clientY: number,
    edges: DockPanel.IEdges,
    splitOptions?: SplitOptions,
  ): IDropTarget {
    // Bail if the mouse is not over the dock panel.
    if (!ElementExt.hitTest(panel.node, clientX, clientY)) {
      return { zone: 'invalid', target: null };
    }

    // Look up the layout for the panel.
    const layout = panel.layout as DockLayout;

    // If the layout is empty, indicate the entire root drop zone.
    if (layout.isEmpty) {
      return { zone: 'root-all', target: null };
    }

    // Hit test the dock layout at the given client position.
    const target = layout.hitTestTabAreas(clientX, clientY);

    // Maximum number of split screens
    if (splitOptions?.maxSplitCount) {
      const layoutConfig = layout.saveLayout();
      const currentScreens = countTabAreas(layoutConfig.main);
      if (!target) {
        return { zone: 'invalid', target: null };
      }
      if (currentScreens >= splitOptions.maxSplitCount) {
        // If the number exceeds the maximum number of screens, the screen can only be filled at this time, not split-screen.
        return { zone: 'widget-all', target };
      }
      // Limit can only split screen left and right
      if (splitOptions?.splitOrientation === 'horizontal') {
        if (target && target.x < target.width / 4) {
          return { zone: 'widget-left', target };
        }
        if (target && target.x > (target.width / 4) * 3) {
          return { zone: 'widget-right', target };
        }
        return { zone: 'widget-all', target };
      }
      // Restriction can only be split screen up and down
      if (splitOptions?.splitOrientation === 'vertical') {
        if (target && target.y < target.height / 4) {
          return { zone: 'widget-top', target };
        }
        if (target && target.y > (target.height / 4) * 3) {
          return { zone: 'widget-bottom', target };
        }
        return { zone: 'widget-all', target };
      }
    }

    // Test the edge zones when in multiple document mode.
    // When the split-screen orientation is restricted, disable the area judgment of the root layer
    if (panel.mode === 'multiple-document') {
      // Get the client rect for the dock panel.
      const panelRect = panel.node.getBoundingClientRect();

      // Compute the distance to each edge of the panel.
      const pl = clientX - panelRect.left + 1;
      const pt = clientY - panelRect.top + 1;
      const pr = panelRect.right - clientX;
      const pb = panelRect.bottom - clientY;

      // Find the minimum distance to an edge.
      const pd = Math.min(pt, pr, pb, pl);

      // Return a root zone if the mouse is within an edge.
      switch (pd) {
        case pt:
          if (pt < edges.top) {
            return { zone: 'root-top', target: null };
          }
          break;
        case pr:
          if (pr < edges.right) {
            return { zone: 'root-right', target: null };
          }
          break;
        case pb:
          if (pb < edges.bottom) {
            return { zone: 'root-bottom', target: null };
          }
          break;
        case pl:
          if (pl < edges.left) {
            return { zone: 'root-left', target: null };
          }
          break;
        default:
          throw 'unreachable';
      }
    }

    // Bail if no target area was found.
    if (!target) {
      return { zone: 'invalid', target: null };
    }

    // Return the whole tab area when in single document mode.
    if (panel.mode === 'single-document') {
      return { zone: 'widget-all', target };
    }

    // Compute the distance to each edge of the tab area.
    let al = target.x - target.left + 1;
    let at = target.y - target.top + 1;
    let ar = target.left + target.width - target.x;
    let ab = target.top + target.height - target.y;

    const tabHeight = target.tabBar.node.getBoundingClientRect().height;
    if (at < tabHeight) {
      return { zone: 'widget-tab', target };
    }

    // Get the X and Y edge sizes for the area.
    const rx = Math.round(target.width / 3);
    const ry = Math.round(target.height / 3);

    // If the mouse is not within an edge, indicate the entire area.
    if (al > rx && ar > rx && at > ry && ab > ry) {
      return { zone: 'widget-all', target };
    }

    // Scale the distances by the slenderness ratio.
    al /= rx;
    at /= ry;
    ar /= rx;
    ab /= ry;

    // Find the widget zone for the area edge.
    const zone: DropZone = getWidgetZoneTarget(al, at, ar, ab);

    // Return the final drop target.
    return { zone, target };
  }

  /**
   * Get the drop reference widget for a tab bar.
   */
  export function getDropRef(tabBar: TabBar<Widget>): Widget | null {
    if (tabBar.titles.length === 0) {
      return null;
    }
    if (tabBar.currentTitle) {
      return tabBar.currentTitle.owner;
    }
    return tabBar.titles[tabBar.titles.length - 1].owner;
  }
}
