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
import { ArrayExt } from '../algorithm';
import { Widget } from './widget';
import { PanelLayout } from './panellayout';
import { type Layout, LayoutItem } from './layout';

/**
 * A layout where visible widgets are stacked atop one another.
 *
 * #### Notes
 * The Z-order of the visible widgets follows their layout order.
 */
export class StackedLayout extends PanelLayout {
  constructor(options: StackedLayout.IOptions = {}) {
    super(options);
    this._hiddenMode =
      options.hiddenMode !== undefined
        ? options.hiddenMode
        : Widget.HiddenMode.Display;
  }

  /**
   * The method for hiding widgets.
   *
   * #### Notes
   * If there is only one child widget, `Display` hiding mode will be used
   * regardless of this setting.
   */
  get hiddenMode(): Widget.HiddenMode {
    return this._hiddenMode;
  }

  /**
   * Set the method for hiding widgets.
   *
   * #### Notes
   * If there is only one child widget, `Display` hiding mode will be used
   * regardless of this setting.
   */
  set hiddenMode(v: Widget.HiddenMode) {
    if (this._hiddenMode === v) {
      return;
    }
    this._hiddenMode = v;
    if (this.widgets.length > 1) {
      this.widgets.forEach(w => {
        w.hiddenMode = this._hiddenMode;
      });
    }
  }

  /**
   * Dispose of the resources held by the layout.
   */
  dispose(): void {
    // Dispose of the layout items.
    for (const item of this._items) {
      item.dispose();
    }

    // Clear the layout state.
    this._box = null;
    this._items.length = 0;

    // Dispose of the rest of the layout.
    super.dispose();
  }

  /**
   * Attach a widget to the parent's DOM node.
   *
   * @param index - The current index of the widget in the layout.
   *
   * @param widget - The widget to attach to the parent.
   *
   * #### Notes
   * This is a reimplementation of the superclass method.
   */
  protected attachWidget(index: number, widget: Widget): void {
    // Using transform create an additional layer in the pixel pipeline
    // to limit the number of layer, it is set only if there is more than one widget.
    if (
      this._hiddenMode === Widget.HiddenMode.Scale &&
      this._items.length > 0
    ) {
      if (this._items.length === 1) {
        this.widgets[0].hiddenMode = Widget.HiddenMode.Scale;
      }
      widget.hiddenMode = Widget.HiddenMode.Scale;
    } else {
      widget.hiddenMode = Widget.HiddenMode.Display;
    }

    // Create and add a new layout item for the widget.
    ArrayExt.insert(this._items, index, new LayoutItem(widget));

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
   * Move a widget in the parent's DOM node.
   *
   * @param fromIndex - The previous index of the widget in the layout.
   *
   * @param toIndex - The current index of the widget in the layout.
   *
   * @param widget - The widget to move in the parent.
   *
   * #### Notes
   * This is a reimplementation of the superclass method.
   */
  protected moveWidget(
    fromIndex: number,
    toIndex: number,
    widget: Widget,
  ): void {
    // Move the layout item for the widget.
    ArrayExt.move(this._items, fromIndex, toIndex);

    // Post an update request for the parent widget.
    this.parent!.update();
  }

  /**
   * Detach a widget from the parent's DOM node.
   *
   * @param index - The previous index of the widget in the layout.
   *
   * @param widget - The widget to detach from the parent.
   *
   * #### Notes
   * This is a reimplementation of the superclass method.
   */
  protected detachWidget(index: number, widget: Widget): void {
    // Remove the layout item for the widget.
    const item = ArrayExt.removeAt(this._items, index);

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

    // Reset the z-index for the widget.
    item!.widget.node.style.zIndex = '';

    // Reset the hidden mode for the widget.
    if (this._hiddenMode === Widget.HiddenMode.Scale) {
      widget.hiddenMode = Widget.HiddenMode.Display;

      // Reset the hidden mode for the first widget if necessary.
      if (this._items.length === 1) {
        this._items[0].widget.hiddenMode = Widget.HiddenMode.Display;
      }
    }

    // Dispose of the layout item.
    item!.dispose();

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
    // Set up the computed minimum size.
    let minW = 0;
    let minH = 0;

    // Update the computed minimum size.
    for (let i = 0, n = this._items.length; i < n; ++i) {
      // Fetch the item.
      const item = this._items[i];

      // Ignore hidden items.
      if (item.isHidden) {
        continue;
      }

      // Update the size limits for the item.
      item.fit();

      // Update the computed minimum size.
      minW = Math.max(minW, item.minWidth);
      minH = Math.max(minH, item.minHeight);
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

    // Compute the visible item count.
    let nVisible = 0;
    for (let i = 0, n = this._items.length; i < n; ++i) {
      nVisible += +!this._items[i].isHidden;
    }

    // Bail early if there are no visible items to layout.
    if (nVisible === 0) {
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
    const top = this._box.paddingTop;
    const left = this._box.paddingLeft;
    const width = offsetWidth - this._box.horizontalSum;
    const height = offsetHeight - this._box.verticalSum;

    // Update the widget stacking order and layout geometry.
    for (let i = 0, n = this._items.length; i < n; ++i) {
      // Fetch the item.
      const item = this._items[i];

      // Ignore hidden items.
      if (item.isHidden) {
        continue;
      }

      // Set the z-index for the widget.
      item.widget.node.style.zIndex = `${i}`;

      // Update the item geometry.
      item.update(left, top, width, height);
    }
  }

  private _dirty = false;

  private _items: LayoutItem[] = [];

  private _box: ElementExt.IBoxSizing | null = null;

  private _hiddenMode: Widget.HiddenMode;
}

/**
 * The namespace for the `StackedLayout` class statics.
 */
export namespace StackedLayout {
  /**
   * An options object for initializing a stacked layout.
   */
  export interface IOptions extends Layout.IOptions {
    /**
     * The method for hiding widgets.
     *
     * The default is `Widget.HiddenMode.Display`.
     */
    hiddenMode?: Widget.HiddenMode;
  }
}
