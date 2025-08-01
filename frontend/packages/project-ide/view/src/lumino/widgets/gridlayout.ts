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
import { AttachedProperty } from '../properties';
import { type Message, MessageLoop } from '../messaging';
import { ElementExt } from '../domutils';
import { ArrayExt } from '../algorithm';
import { Widget } from './widget';
import { Layout, LayoutItem } from './layout';
import { BoxEngine, BoxSizer } from './boxengine';

/**
 * A layout which arranges its widgets in a grid.
 */
export class GridLayout extends Layout {
  /**
   * Construct a new grid layout.
   *
   * @param options - The options for initializing the layout.
   */
  constructor(options: GridLayout.IOptions = {}) {
    super(options);
    if (options.rowCount !== undefined) {
      Private.reallocSizers(this._rowSizers, options.rowCount);
    }
    if (options.columnCount !== undefined) {
      Private.reallocSizers(this._columnSizers, options.columnCount);
    }
    if (options.rowSpacing !== undefined) {
      this._rowSpacing = Private.clampValue(options.rowSpacing);
    }
    if (options.columnSpacing !== undefined) {
      this._columnSpacing = Private.clampValue(options.columnSpacing);
    }
  }

  /**
   * Dispose of the resources held by the layout.
   */
  dispose(): void {
    // Dispose of the widgets and layout items.
    for (const item of this._items) {
      const { widget } = item;
      item.dispose();
      widget.dispose();
    }

    // Clear the layout state.
    this._box = null;
    this._items.length = 0;
    this._rowStarts.length = 0;
    this._rowSizers.length = 0;
    this._columnStarts.length = 0;
    this._columnSizers.length = 0;

    // Dispose of the rest of the layout.
    super.dispose();
  }

  /**
   * Get the number of rows in the layout.
   */
  get rowCount(): number {
    return this._rowSizers.length;
  }

  /**
   * Set the number of rows in the layout.
   *
   * #### Notes
   * The minimum row count is `1`.
   */
  set rowCount(value: number) {
    // Do nothing if the row count does not change.
    if (value === this.rowCount) {
      return;
    }

    // Reallocate the row sizers.
    Private.reallocSizers(this._rowSizers, value);

    // Schedule a fit of the parent.
    if (this.parent) {
      this.parent.fit();
    }
  }

  /**
   * Get the number of columns in the layout.
   */
  get columnCount(): number {
    return this._columnSizers.length;
  }

  /**
   * Set the number of columns in the layout.
   *
   * #### Notes
   * The minimum column count is `1`.
   */
  set columnCount(value: number) {
    // Do nothing if the column count does not change.
    if (value === this.columnCount) {
      return;
    }

    // Reallocate the column sizers.
    Private.reallocSizers(this._columnSizers, value);

    // Schedule a fit of the parent.
    if (this.parent) {
      this.parent.fit();
    }
  }

  /**
   * Get the row spacing for the layout.
   */
  get rowSpacing(): number {
    return this._rowSpacing;
  }

  /**
   * Set the row spacing for the layout.
   */
  set rowSpacing(value: number) {
    // Clamp the spacing to the allowed range.
    value = Private.clampValue(value);

    // Bail if the spacing does not change
    if (this._rowSpacing === value) {
      return;
    }

    // Update the internal spacing.
    this._rowSpacing = value;

    // Schedule a fit of the parent.
    if (this.parent) {
      this.parent.fit();
    }
  }

  /**
   * Get the column spacing for the layout.
   */
  get columnSpacing(): number {
    return this._columnSpacing;
  }

  /**
   * Set the col spacing for the layout.
   */
  set columnSpacing(value: number) {
    // Clamp the spacing to the allowed range.
    value = Private.clampValue(value);

    // Bail if the spacing does not change
    if (this._columnSpacing === value) {
      return;
    }

    // Update the internal spacing.
    this._columnSpacing = value;

    // Schedule a fit of the parent.
    if (this.parent) {
      this.parent.fit();
    }
  }

  /**
   * Get the stretch factor for a specific row.
   *
   * @param index - The row index of interest.
   *
   * @returns The stretch factor for the row.
   *
   * #### Notes
   * This returns `-1` if the index is out of range.
   */
  rowStretch(index: number): number {
    const sizer = this._rowSizers[index];
    return sizer ? sizer.stretch : -1;
  }

  /**
   * Set the stretch factor for a specific row.
   *
   * @param index - The row index of interest.
   *
   * @param value - The stretch factor for the row.
   *
   * #### Notes
   * This is a no-op if the index is out of range.
   */
  setRowStretch(index: number, value: number): void {
    // Look up the row sizer.
    const sizer = this._rowSizers[index];

    // Bail if the index is out of range.
    if (!sizer) {
      return;
    }

    // Clamp the value to the allowed range.
    value = Private.clampValue(value);

    // Bail if the stretch does not change.
    if (sizer.stretch === value) {
      return;
    }

    // Update the sizer stretch.
    sizer.stretch = value;

    // Schedule an update of the parent.
    if (this.parent) {
      this.parent.update();
    }
  }

  /**
   * Get the stretch factor for a specific column.
   *
   * @param index - The column index of interest.
   *
   * @returns The stretch factor for the column.
   *
   * #### Notes
   * This returns `-1` if the index is out of range.
   */
  columnStretch(index: number): number {
    const sizer = this._columnSizers[index];
    return sizer ? sizer.stretch : -1;
  }

  /**
   * Set the stretch factor for a specific column.
   *
   * @param index - The column index of interest.
   *
   * @param value - The stretch factor for the column.
   *
   * #### Notes
   * This is a no-op if the index is out of range.
   */
  setColumnStretch(index: number, value: number): void {
    // Look up the column sizer.
    const sizer = this._columnSizers[index];

    // Bail if the index is out of range.
    if (!sizer) {
      return;
    }

    // Clamp the value to the allowed range.
    value = Private.clampValue(value);

    // Bail if the stretch does not change.
    if (sizer.stretch === value) {
      return;
    }

    // Update the sizer stretch.
    sizer.stretch = value;

    // Schedule an update of the parent.
    if (this.parent) {
      this.parent.update();
    }
  }

  /**
   * Create an iterator over the widgets in the layout.
   *
   * @returns A new iterator over the widgets in the layout.
   */
  *[Symbol.iterator](): IterableIterator<Widget> {
    for (const item of this._items) {
      yield item.widget;
    }
  }

  /**
   * Add a widget to the grid layout.
   *
   * @param widget - The widget to add to the layout.
   *
   * #### Notes
   * If the widget is already contained in the layout, this is no-op.
   */
  addWidget(widget: Widget): void {
    // Look up the index for the widget.
    const i = ArrayExt.findFirstIndex(this._items, it => it.widget === widget);

    // Bail if the widget is already in the layout.
    if (i !== -1) {
      return;
    }

    // Add the widget to the layout.
    this._items.push(new LayoutItem(widget));

    // Attach the widget to the parent.
    if (this.parent) {
      this.attachWidget(widget);
    }
  }

  /**
   * Remove a widget from the grid layout.
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
    // Look up the index for the widget.
    const i = ArrayExt.findFirstIndex(this._items, it => it.widget === widget);

    // Bail if the widget is not in the layout.
    if (i === -1) {
      return;
    }

    // Remove the widget from the layout.
    const item = ArrayExt.removeAt(this._items, i)!;

    // Detach the widget from the parent.
    if (this.parent) {
      this.detachWidget(widget);
    }

    // Dispose the layout item.
    item.dispose();
  }

  /**
   * Perform layout initialization which requires the parent widget.
   */
  protected init(): void {
    super.init();
    for (const widget of this) {
      this.attachWidget(widget);
    }
  }

  /**
   * Attach a widget to the parent's DOM node.
   *
   * @param widget - The widget to attach to the parent.
   */
  protected attachWidget(widget: Widget): void {
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

    // Post a fit request for the parent widget.
    this.parent!.fit();
  }

  /**
   * Detach a widget from the parent's DOM node.
   *
   * @param widget - The widget to detach from the parent.
   */
  protected detachWidget(widget: Widget): void {
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

    // Post a fit request for the parent widget.
    this.parent!.fit();
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
   * Fit the layout to the total size required by the widgets.
   */
  private _fit(): void {
    // Reset the min sizes of the sizers.
    for (let i = 0, n = this.rowCount; i < n; ++i) {
      this._rowSizers[i].minSize = 0;
    }
    for (let i = 0, n = this.columnCount; i < n; ++i) {
      this._columnSizers[i].minSize = 0;
    }

    // Filter for the visible layout items.
    const items = this._items.filter(it => !it.isHidden);

    // Fit the layout items.
    for (let i = 0, n = items.length; i < n; ++i) {
      items[i].fit();
    }

    // Get the max row and column index.
    const maxRow = this.rowCount - 1;
    const maxCol = this.columnCount - 1;

    // Sort the items by row span.
    items.sort(Private.rowSpanCmp);

    // Update the min sizes of the row sizers.
    for (let i = 0, n = items.length; i < n; ++i) {
      // Fetch the item.
      const item = items[i];

      // Get the row bounds for the item.
      const config = GridLayout.getCellConfig(item.widget);
      const r1 = Math.min(config.row, maxRow);
      const r2 = Math.min(config.row + config.rowSpan - 1, maxRow);

      // Distribute the minimum height to the sizers as needed.
      Private.distributeMin(this._rowSizers, r1, r2, item.minHeight);
    }

    // Sort the items by column span.
    items.sort(Private.columnSpanCmp);

    // Update the min sizes of the column sizers.
    for (let i = 0, n = items.length; i < n; ++i) {
      // Fetch the item.
      const item = items[i];

      // Get the column bounds for the item.
      const config = GridLayout.getCellConfig(item.widget);
      const c1 = Math.min(config.column, maxCol);
      const c2 = Math.min(config.column + config.columnSpan - 1, maxCol);

      // Distribute the minimum width to the sizers as needed.
      Private.distributeMin(this._columnSizers, c1, c2, item.minWidth);
    }

    // If no size constraint is needed, just update the parent.
    if (this.fitPolicy === 'set-no-constraint') {
      MessageLoop.sendMessage(this.parent!, Widget.Msg.UpdateRequest);
      return;
    }

    // Set up the computed min size.
    let minH = maxRow * this._rowSpacing;
    let minW = maxCol * this._columnSpacing;

    // Add the sizer minimums to the computed min size.
    for (let i = 0, n = this.rowCount; i < n; ++i) {
      minH += this._rowSizers[i].minSize;
    }
    for (let i = 0, n = this.columnCount; i < n; ++i) {
      minW += this._columnSizers[i].minSize;
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

    // Compute the layout area adjusted for border and padding.
    const top = this._box.paddingTop;
    const left = this._box.paddingLeft;
    const width = offsetWidth - this._box.horizontalSum;
    const height = offsetHeight - this._box.verticalSum;

    // Get the max row and column index.
    const maxRow = this.rowCount - 1;
    const maxCol = this.columnCount - 1;

    // Compute the total fixed row and column space.
    const fixedRowSpace = maxRow * this._rowSpacing;
    const fixedColSpace = maxCol * this._columnSpacing;

    // Distribute the available space to the box sizers.
    BoxEngine.calc(this._rowSizers, Math.max(0, height - fixedRowSpace));
    BoxEngine.calc(this._columnSizers, Math.max(0, width - fixedColSpace));

    // Update the row start positions.
    for (let i = 0, pos = top, n = this.rowCount; i < n; ++i) {
      this._rowStarts[i] = pos;
      pos += this._rowSizers[i].size + this._rowSpacing;
    }

    // Update the column start positions.
    for (let i = 0, pos = left, n = this.columnCount; i < n; ++i) {
      this._columnStarts[i] = pos;
      pos += this._columnSizers[i].size + this._columnSpacing;
    }

    // Update the geometry of the layout items.
    for (let i = 0, n = this._items.length; i < n; ++i) {
      // Fetch the item.
      const item = this._items[i];

      // Ignore hidden items.
      if (item.isHidden) {
        continue;
      }

      // Fetch the cell bounds for the widget.
      const config = GridLayout.getCellConfig(item.widget);
      const r1 = Math.min(config.row, maxRow);
      const c1 = Math.min(config.column, maxCol);
      const r2 = Math.min(config.row + config.rowSpan - 1, maxRow);
      const c2 = Math.min(config.column + config.columnSpan - 1, maxCol);

      // Compute the cell geometry.
      const x = this._columnStarts[c1];
      const y = this._rowStarts[r1];
      const w = this._columnStarts[c2] + this._columnSizers[c2].size - x;
      const h = this._rowStarts[r2] + this._rowSizers[r2].size - y;

      // Update the geometry of the layout item.
      item.update(x, y, w, h);
    }
  }

  private _dirty = false;

  private _rowSpacing = 4;

  private _columnSpacing = 4;

  private _items: LayoutItem[] = [];

  private _rowStarts: number[] = [];

  private _columnStarts: number[] = [];

  private _rowSizers: BoxSizer[] = [new BoxSizer()];

  private _columnSizers: BoxSizer[] = [new BoxSizer()];

  private _box: ElementExt.IBoxSizing | null = null;
}

/**
 * The namespace for the `GridLayout` class statics.
 */
export namespace GridLayout {
  /**
   * An options object for initializing a grid layout.
   */
  export interface IOptions extends Layout.IOptions {
    /**
     * The initial row count for the layout.
     *
     * The default is `1`.
     */
    rowCount?: number;

    /**
     * The initial column count for the layout.
     *
     * The default is `1`.
     */
    columnCount?: number;

    /**
     * The spacing between rows in the layout.
     *
     * The default is `4`.
     */
    rowSpacing?: number;

    /**
     * The spacing between columns in the layout.
     *
     * The default is `4`.
     */
    columnSpacing?: number;
  }

  /**
   * An object which holds the cell configuration for a widget.
   */
  export interface ICellConfig {
    /**
     * The row index for the widget.
     */
    readonly row: number;

    /**
     * The column index for the widget.
     */
    readonly column: number;

    /**
     * The row span for the widget.
     */
    readonly rowSpan: number;

    /**
     * The column span for the widget.
     */
    readonly columnSpan: number;
  }

  /**
   * Get the cell config for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The cell config for the widget.
   */
  export function getCellConfig(widget: Widget): ICellConfig {
    return Private.cellConfigProperty.get(widget);
  }

  /**
   * Set the cell config for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the cell config.
   */
  export function setCellConfig(
    widget: Widget,
    value: Partial<ICellConfig>,
  ): void {
    Private.cellConfigProperty.set(widget, Private.normalizeConfig(value));
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * The property descriptor for the widget cell config.
   */
  export const cellConfigProperty = new AttachedProperty<
    Widget,
    GridLayout.ICellConfig
  >({
    name: 'cellConfig',
    create: () => ({ row: 0, column: 0, rowSpan: 1, columnSpan: 1 }),
    changed: onChildCellConfigChanged,
  });

  /**
   * Normalize a partial cell config object.
   */
  export function normalizeConfig(
    config: Partial<GridLayout.ICellConfig>,
  ): GridLayout.ICellConfig {
    const row = Math.max(0, Math.floor(config.row || 0));
    const column = Math.max(0, Math.floor(config.column || 0));
    const rowSpan = Math.max(1, Math.floor(config.rowSpan || 0));
    const columnSpan = Math.max(1, Math.floor(config.columnSpan || 0));
    return { row, column, rowSpan, columnSpan };
  }

  /**
   * Clamp a value to an integer >= 0.
   */
  export function clampValue(value: number): number {
    return Math.max(0, Math.floor(value));
  }

  /**
   * A sort comparison function for row spans.
   */
  export function rowSpanCmp(a: LayoutItem, b: LayoutItem): number {
    const c1 = cellConfigProperty.get(a.widget);
    const c2 = cellConfigProperty.get(b.widget);
    return c1.rowSpan - c2.rowSpan;
  }

  /**
   * A sort comparison function for column spans.
   */
  export function columnSpanCmp(a: LayoutItem, b: LayoutItem): number {
    const c1 = cellConfigProperty.get(a.widget);
    const c2 = cellConfigProperty.get(b.widget);
    return c1.columnSpan - c2.columnSpan;
  }

  /**
   * Reallocate the box sizers for the given grid dimensions.
   */
  export function reallocSizers(sizers: BoxSizer[], count: number): void {
    // Coerce the count to the valid range.
    count = Math.max(1, Math.floor(count));

    // Add the missing sizers.
    while (sizers.length < count) {
      sizers.push(new BoxSizer());
    }

    // Remove the extra sizers.
    if (sizers.length > count) {
      sizers.length = count;
    }
  }

  /**
   * Distribute a min size constraint across a range of sizers.
   */
  export function distributeMin(
    sizers: BoxSizer[],
    i1: number,
    i2: number,
    minSize: number,
  ): void {
    // Sanity check the indices.
    if (i2 < i1) {
      return;
    }

    // Handle the simple case of no cell span.
    if (i1 === i2) {
      const sizer = sizers[i1];
      sizer.minSize = Math.max(sizer.minSize, minSize);
      return;
    }

    // Compute the total current min size of the span.
    let totalMin = 0;
    for (let i = i1; i <= i2; ++i) {
      totalMin += sizers[i].minSize;
    }

    // Do nothing if the total is greater than the required.
    if (totalMin >= minSize) {
      return;
    }

    // Compute the portion of the space to allocate to each sizer.
    const portion = (minSize - totalMin) / (i2 - i1 + 1);

    // Add the portion to each sizer.
    for (let i = i1; i <= i2; ++i) {
      sizers[i].minSize += portion;
    }
  }

  /**
   * The change handler for the child cell config property.
   */
  function onChildCellConfigChanged(child: Widget): void {
    if (child.parent && child.parent.layout instanceof GridLayout) {
      child.parent.fit();
    }
  }
}
