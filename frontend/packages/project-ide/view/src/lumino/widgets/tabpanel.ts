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
import { MessageLoop } from '../messaging';
import { Platform } from '../domutils';
import { Widget } from './widget';
import { TabBar } from './tabbar';
import { StackedPanel } from './stackedpanel';
import { BoxLayout } from './boxlayout';

/**
 * A widget which combines a `TabBar` and a `StackedPanel`.
 *
 * #### Notes
 * This is a simple panel which handles the common case of a tab bar
 * placed next to a content area. The selected tab controls the widget
 * which is shown in the content area.
 *
 * For use cases which require more control than is provided by this
 * panel, the `TabBar` widget may be used independently.
 */
export class TabPanel extends Widget {
  /**
   * Construct a new tab panel.
   *
   * @param options - The options for initializing the tab panel.
   */
  constructor(options: TabPanel.IOptions = {}) {
    super();
    this.addClass('lm-TabPanel');

    // Create the tab bar and stacked panel.
    this.tabBar = new TabBar<Widget>(options);
    this.tabBar.addClass('lm-TabPanel-tabBar');
    this.stackedPanel = new StackedPanel();
    this.stackedPanel.addClass('lm-TabPanel-stackedPanel');

    // Connect the tab bar signal handlers.
    this.tabBar.tabMoved.connect(this._onTabMoved, this);
    this.tabBar.currentChanged.connect(this._onCurrentChanged, this);
    this.tabBar.tabCloseRequested.connect(this._onTabCloseRequested, this);
    this.tabBar.tabActivateRequested.connect(
      this._onTabActivateRequested,
      this,
    );
    this.tabBar.addRequested.connect(this._onTabAddRequested, this);

    // Connect the stacked panel signal handlers.
    this.stackedPanel.widgetRemoved.connect(this._onWidgetRemoved, this);

    // Get the data related to the placement.
    this._tabPlacement = options.tabPlacement || 'top';
    const direction = Private.directionFromPlacement(this._tabPlacement);
    const orientation = Private.orientationFromPlacement(this._tabPlacement);

    // Configure the tab bar for the placement.
    this.tabBar.orientation = orientation;
    this.tabBar.dataset.placement = this._tabPlacement;

    // Create the box layout.
    const layout = new BoxLayout({ direction, spacing: 0 });

    // Set the stretch factors for the child widgets.
    BoxLayout.setStretch(this.tabBar, 0);
    BoxLayout.setStretch(this.stackedPanel, 1);

    // Add the child widgets to the layout.
    layout.addWidget(this.tabBar);
    layout.addWidget(this.stackedPanel);

    // Install the layout on the tab panel.
    this.layout = layout;
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
  get currentChanged(): ISignal<this, TabPanel.ICurrentChangedArgs> {
    return this._currentChanged;
  }

  /**
   * Get the index of the currently selected tab.
   *
   * #### Notes
   * This will be `-1` if no tab is selected.
   */
  get currentIndex(): number {
    return this.tabBar.currentIndex;
  }

  /**
   * Set the index of the currently selected tab.
   *
   * #### Notes
   * If the index is out of range, it will be set to `-1`.
   */
  set currentIndex(value: number) {
    this.tabBar.currentIndex = value;
  }

  /**
   * Get the currently selected widget.
   *
   * #### Notes
   * This will be `null` if there is no selected tab.
   */
  get currentWidget(): Widget | null {
    const title = this.tabBar.currentTitle;
    return title ? title.owner : null;
  }

  /**
   * Set the currently selected widget.
   *
   * #### Notes
   * If the widget is not in the panel, it will be set to `null`.
   */
  set currentWidget(value: Widget | null) {
    this.tabBar.currentTitle = value ? value.title : null;
  }

  /**
   * Get the whether the tabs are movable by the user.
   *
   * #### Notes
   * Tabs can always be moved programmatically.
   */
  get tabsMovable(): boolean {
    return this.tabBar.tabsMovable;
  }

  /**
   * Set the whether the tabs are movable by the user.
   *
   * #### Notes
   * Tabs can always be moved programmatically.
   */
  set tabsMovable(value: boolean) {
    this.tabBar.tabsMovable = value;
  }

  /**
   * Get the whether the add button is enabled.
   *
   */
  get addButtonEnabled(): boolean {
    return this.tabBar.addButtonEnabled;
  }

  /**
   * Set the whether the add button is enabled.
   *
   */
  set addButtonEnabled(value: boolean) {
    this.tabBar.addButtonEnabled = value;
  }

  /**
   * Get the tab placement for the tab panel.
   *
   * #### Notes
   * This controls the position of the tab bar relative to the content.
   */
  get tabPlacement(): TabPanel.TabPlacement {
    return this._tabPlacement;
  }

  /**
   * Set the tab placement for the tab panel.
   *
   * #### Notes
   * This controls the position of the tab bar relative to the content.
   */
  set tabPlacement(value: TabPanel.TabPlacement) {
    // Bail if the placement does not change.
    if (this._tabPlacement === value) {
      return;
    }

    // Update the internal value.
    this._tabPlacement = value;

    // Get the values related to the placement.
    const direction = Private.directionFromPlacement(value);
    const orientation = Private.orientationFromPlacement(value);

    // Configure the tab bar for the placement.
    this.tabBar.orientation = orientation;
    this.tabBar.dataset.placement = value;

    // Update the layout direction.
    (this.layout as BoxLayout).direction = direction;
  }

  /**
   * A signal emitted when the add button on a tab bar is clicked.
   *
   */
  get addRequested(): ISignal<this, TabBar<Widget>> {
    return this._addRequested;
  }

  /**
   * The tab bar used by the tab panel.
   *
   * #### Notes
   * Modifying the tab bar directly can lead to undefined behavior.
   */
  readonly tabBar: TabBar<Widget>;

  /**
   * The stacked panel used by the tab panel.
   *
   * #### Notes
   * Modifying the panel directly can lead to undefined behavior.
   */
  readonly stackedPanel: StackedPanel;

  /**
   * A read-only array of the widgets in the panel.
   */
  get widgets(): ReadonlyArray<Widget> {
    return this.stackedPanel.widgets;
  }

  /**
   * Add a widget to the end of the tab panel.
   *
   * @param widget - The widget to add to the tab panel.
   *
   * #### Notes
   * If the widget is already contained in the panel, it will be moved.
   *
   * The widget's `title` is used to populate the tab.
   */
  addWidget(widget: Widget): void {
    this.insertWidget(this.widgets.length, widget);
  }

  /**
   * Insert a widget into the tab panel at a specified index.
   *
   * @param index - The index at which to insert the widget.
   *
   * @param widget - The widget to insert into to the tab panel.
   *
   * #### Notes
   * If the widget is already contained in the panel, it will be moved.
   *
   * The widget's `title` is used to populate the tab.
   */
  insertWidget(index: number, widget: Widget): void {
    if (widget !== this.currentWidget) {
      widget.hide();
    }
    this.stackedPanel.insertWidget(index, widget);
    this.tabBar.insertTab(index, widget.title);

    widget.node.setAttribute('role', 'tabpanel');

    const { renderer } = this.tabBar;
    if (renderer instanceof TabBar.Renderer) {
      const tabId = renderer.createTabKey({
        title: widget.title,
        current: false,
        zIndex: 0,
      });
      widget.node.setAttribute('aria-labelledby', tabId);
    }
  }

  /**
   * Handle the `currentChanged` signal from the tab bar.
   */
  private _onCurrentChanged(
    sender: TabBar<Widget>,
    args: TabBar.ICurrentChangedArgs<Widget>,
  ): void {
    // Extract the previous and current title from the args.
    const { previousIndex, previousTitle, currentIndex, currentTitle } = args;

    // Extract the widgets from the titles.
    const previousWidget = previousTitle ? previousTitle.owner : null;
    const currentWidget = currentTitle ? currentTitle.owner : null;

    // Hide the previous widget.
    if (previousWidget) {
      previousWidget.hide();
    }

    // Show the current widget.
    if (currentWidget) {
      currentWidget.show();
    }

    // Emit the `currentChanged` signal for the tab panel.
    this._currentChanged.emit({
      previousIndex,
      previousWidget,
      currentIndex,
      currentWidget,
    });

    // Flush the message loop on IE and Edge to prevent flicker.
    if (Platform.IS_EDGE || Platform.IS_IE) {
      MessageLoop.flush();
    }
  }

  /**
   * Handle the `tabAddRequested` signal from the tab bar.
   */
  private _onTabAddRequested(sender: TabBar<Widget>, args: void): void {
    this._addRequested.emit(sender);
  }

  /**
   * Handle the `tabActivateRequested` signal from the tab bar.
   */
  private _onTabActivateRequested(
    sender: TabBar<Widget>,
    args: TabBar.ITabActivateRequestedArgs<Widget>,
  ): void {
    args.title.owner.activate();
  }

  /**
   * Handle the `tabCloseRequested` signal from the tab bar.
   */
  private _onTabCloseRequested(
    sender: TabBar<Widget>,
    args: TabBar.ITabCloseRequestedArgs<Widget>,
  ): void {
    args.title.owner.close();
  }

  /**
   * Handle the `tabMoved` signal from the tab bar.
   */
  private _onTabMoved(
    sender: TabBar<Widget>,
    args: TabBar.ITabMovedArgs<Widget>,
  ): void {
    this.stackedPanel.insertWidget(args.toIndex, args.title.owner);
  }

  /**
   * Handle the `widgetRemoved` signal from the stacked panel.
   */
  private _onWidgetRemoved(sender: StackedPanel, widget: Widget): void {
    widget.node.removeAttribute('role');
    widget.node.removeAttribute('aria-labelledby');
    this.tabBar.removeTab(widget.title);
  }

  private _tabPlacement: TabPanel.TabPlacement;

  private _currentChanged = new Signal<this, TabPanel.ICurrentChangedArgs>(
    this,
  );

  private _addRequested = new Signal<this, TabBar<Widget>>(this);
}

/**
 * The namespace for the `TabPanel` class statics.
 */
export namespace TabPanel {
  /**
   * A type alias for tab placement in a tab bar.
   */
  export type TabPlacement =
    | /**
     * The tabs are placed as a row above the content.
     */
    'top'

    /**
     * The tabs are placed as a column to the left of the content.
     */
    | 'left'

    /**
     * The tabs are placed as a column to the right of the content.
     */
    | 'right'

    /**
     * The tabs are placed as a row below the content.
     */
    | 'bottom';

  /**
   * An options object for initializing a tab panel.
   */
  export interface IOptions {
    /**
     * The document to use with the tab panel.
     *
     * The default is the global `document` instance.
     */
    document?: Document | ShadowRoot;

    /**
     * Whether the tabs are movable by the user.
     *
     * The default is `false`.
     */
    tabsMovable?: boolean;

    /**
     * Whether the button to add new tabs is enabled.
     *
     * The default is `false`.
     */
    addButtonEnabled?: boolean;

    /**
     * The placement of the tab bar relative to the content.
     *
     * The default is `'top'`.
     */
    tabPlacement?: TabPlacement;

    /**
     * The renderer for the panel's tab bar.
     *
     * The default is a shared renderer instance.
     */
    renderer?: TabBar.IRenderer<Widget>;
  }

  /**
   * The arguments object for the `currentChanged` signal.
   */
  export interface ICurrentChangedArgs {
    /**
     * The previously selected index.
     */
    previousIndex: number;

    /**
     * The previously selected widget.
     */
    previousWidget: Widget | null;

    /**
     * The currently selected index.
     */
    currentIndex: number;

    /**
     * The currently selected widget.
     */
    currentWidget: Widget | null;
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * Convert a tab placement to tab bar orientation.
   */
  export function orientationFromPlacement(
    plc: TabPanel.TabPlacement,
  ): TabBar.Orientation {
    return placementToOrientationMap[plc];
  }

  /**
   * Convert a tab placement to a box layout direction.
   */
  export function directionFromPlacement(
    plc: TabPanel.TabPlacement,
  ): BoxLayout.Direction {
    return placementToDirectionMap[plc];
  }

  /**
   * A mapping of tab placement to tab bar orientation.
   */
  const placementToOrientationMap: { [key: string]: TabBar.Orientation } = {
    top: 'horizontal',
    left: 'vertical',
    right: 'vertical',
    bottom: 'horizontal',
  };

  /**
   * A mapping of tab placement to box layout direction.
   */
  const placementToDirectionMap: { [key: string]: BoxLayout.Direction } = {
    top: 'top-to-bottom',
    left: 'left-to-right',
    right: 'right-to-left',
    bottom: 'bottom-to-top',
  };
}
