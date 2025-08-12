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
import Utils from './utils';
import { PanelLayout } from './panellayout';
import { LayoutItem } from './layout';
import { BoxEngine, BoxSizer } from './boxengine';

/**
 * A layout which arranges its widgets in a single row or column.
 */
export class BoxLayout extends PanelLayout {
  /**
   * Construct a new box layout.
   *
   * @param options - The options for initializing the layout.
   */
  constructor(options: BoxLayout.IOptions = {}) {
    super();
    if (options.direction !== undefined) {
      this._direction = options.direction;
    }
    if (options.alignment !== undefined) {
      this._alignment = options.alignment;
    }
    if (options.spacing !== undefined) {
      this._spacing = Utils.clampDimension(options.spacing);
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
    this._sizers.length = 0;

    // Dispose of the rest of the layout.
    super.dispose();
  }

  /**
   * Get the layout direction for the box layout.
   */
  get direction(): BoxLayout.Direction {
    return this._direction;
  }

  /**
   * Set the layout direction for the box layout.
   */
  set direction(value: BoxLayout.Direction) {
    if (this._direction === value) {
      return;
    }
    this._direction = value;
    if (!this.parent) {
      return;
    }
    this.parent.dataset.direction = value;
    this.parent.fit();
  }

  /**
   * Get the content alignment for the box layout.
   *
   * #### Notes
   * This is the alignment of the widgets in the layout direction.
   *
   * The alignment has no effect if the widgets can expand to fill the
   * entire box layout.
   */
  get alignment(): BoxLayout.Alignment {
    return this._alignment;
  }

  /**
   * Set the content alignment for the box layout.
   *
   * #### Notes
   * This is the alignment of the widgets in the layout direction.
   *
   * The alignment has no effect if the widgets can expand to fill the
   * entire box layout.
   */
  set alignment(value: BoxLayout.Alignment) {
    if (this._alignment === value) {
      return;
    }
    this._alignment = value;
    if (!this.parent) {
      return;
    }
    this.parent.dataset.alignment = value;
    this.parent.update();
  }

  /**
   * Get the inter-element spacing for the box layout.
   */
  get spacing(): number {
    return this._spacing;
  }

  /**
   * Set the inter-element spacing for the box layout.
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
   * Perform layout initialization which requires the parent widget.
   */
  protected init(): void {
    this.parent!.dataset.direction = this.direction;
    this.parent!.dataset.alignment = this.alignment;
    super.init();
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
    // Create and add a new layout item for the widget.
    ArrayExt.insert(this._items, index, new LayoutItem(widget));

    // Create and add a new sizer for the widget.
    ArrayExt.insert(this._sizers, index, new BoxSizer());

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

    // Move the sizer for the widget.
    ArrayExt.move(this._sizers, fromIndex, toIndex);

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

    // Remove the sizer for the widget.
    ArrayExt.removeAt(this._sizers, index);

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
    // Compute the visible item count.
    let nVisible = 0;
    for (let i = 0, n = this._items.length; i < n; ++i) {
      nVisible += +!this._items[i].isHidden;
    }

    // Update the fixed space for the visible items.
    this._fixed = this._spacing * Math.max(0, nVisible - 1);

    // Setup the computed minimum size.
    const horz = Private.isHorizontal(this._direction);
    let minW = horz ? this._fixed : 0;
    let minH = horz ? 0 : this._fixed;

    // Update the sizers and computed minimum size.
    for (let i = 0, n = this._items.length; i < n; ++i) {
      // Fetch the item and corresponding box sizer.
      const item = this._items[i];
      const sizer = this._sizers[i];

      // If the item is hidden, it should consume zero size.
      if (item.isHidden) {
        sizer.minSize = 0;
        sizer.maxSize = 0;
        continue;
      }

      // Update the size limits for the item.
      item.fit();

      // Update the size basis and stretch factor.
      sizer.sizeHint = BoxLayout.getSizeBasis(item.widget);
      sizer.stretch = BoxLayout.getStretch(item.widget);

      // Update the sizer limits and computed min size.
      if (horz) {
        sizer.minSize = item.minWidth;
        sizer.maxSize = item.maxWidth;
        minW += item.minWidth;
        minH = Math.max(minH, item.minHeight);
      } else {
        sizer.minSize = item.minHeight;
        sizer.maxSize = item.maxHeight;
        minH += item.minHeight;
        minW = Math.max(minW, item.minWidth);
      }
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

    // Compute the layout area adjusted for border and padding.
    let top = this._box.paddingTop;
    let left = this._box.paddingLeft;
    const width = offsetWidth - this._box.horizontalSum;
    const height = offsetHeight - this._box.verticalSum;

    // Distribute the layout space and adjust the start position.
    let delta: number;
    switch (this._direction) {
      case 'left-to-right':
        delta = BoxEngine.calc(this._sizers, Math.max(0, width - this._fixed));
        break;
      case 'top-to-bottom':
        delta = BoxEngine.calc(this._sizers, Math.max(0, height - this._fixed));
        break;
      case 'right-to-left':
        delta = BoxEngine.calc(this._sizers, Math.max(0, width - this._fixed));
        left += width;
        break;
      case 'bottom-to-top':
        delta = BoxEngine.calc(this._sizers, Math.max(0, height - this._fixed));
        top += height;
        break;
      default:
        throw 'unreachable';
    }

    // Setup the variables for justification and alignment offset.
    let extra = 0;
    let offset = 0;

    // Account for alignment if there is extra layout space.
    if (delta > 0) {
      switch (this._alignment) {
        case 'start':
          break;
        case 'center':
          extra = 0;
          offset = delta / 2;
          break;
        case 'end':
          extra = 0;
          offset = delta;
          break;
        case 'justify':
          extra = delta / nVisible;
          offset = 0;
          break;
        default:
          throw 'unreachable';
      }
    }

    // Layout the items using the computed box sizes.
    for (let i = 0, n = this._items.length; i < n; ++i) {
      // Fetch the item.
      const item = this._items[i];

      // Ignore hidden items.
      if (item.isHidden) {
        continue;
      }

      // Fetch the computed size for the widget.
      const { size } = this._sizers[i];

      // Update the widget geometry and advance the relevant edge.
      switch (this._direction) {
        case 'left-to-right':
          item.update(left + offset, top, size + extra, height);
          left += size + extra + this._spacing;
          break;
        case 'top-to-bottom':
          item.update(left, top + offset, width, size + extra);
          top += size + extra + this._spacing;
          break;
        case 'right-to-left':
          item.update(left - offset - size - extra, top, size + extra, height);
          left -= size + extra + this._spacing;
          break;
        case 'bottom-to-top':
          item.update(left, top - offset - size - extra, width, size + extra);
          top -= size + extra + this._spacing;
          break;
        default:
          throw 'unreachable';
      }
    }
  }

  private _fixed = 0;

  private _spacing = 4;

  private _dirty = false;

  private _sizers: BoxSizer[] = [];

  private _items: LayoutItem[] = [];

  private _box: ElementExt.IBoxSizing | null = null;

  private _alignment: BoxLayout.Alignment = 'start';

  private _direction: BoxLayout.Direction = 'top-to-bottom';
}

/**
 * The namespace for the `BoxLayout` class statics.
 */
export namespace BoxLayout {
  /**
   * A type alias for a box layout direction.
   */
  export type Direction =
    | 'left-to-right'
    | 'right-to-left'
    | 'top-to-bottom'
    | 'bottom-to-top';

  /**
   * A type alias for a box layout alignment.
   */
  export type Alignment = 'start' | 'center' | 'end' | 'justify';

  /**
   * An options object for initializing a box layout.
   */
  export interface IOptions {
    /**
     * The direction of the layout.
     *
     * The default is `'top-to-bottom'`.
     */
    direction?: Direction;

    /**
     * The content alignment of the layout.
     *
     * The default is `'start'`.
     */
    alignment?: Alignment;

    /**
     * The spacing between items in the layout.
     *
     * The default is `4`.
     */
    spacing?: number;
  }

  /**
   * Get the box layout stretch factor for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The box layout stretch factor for the widget.
   */
  export function getStretch(widget: Widget): number {
    return Private.stretchProperty.get(widget);
  }

  /**
   * Set the box layout stretch factor for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the stretch factor.
   */
  export function setStretch(widget: Widget, value: number): void {
    Private.stretchProperty.set(widget, value);
  }

  /**
   * Get the box layout size basis for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The box layout size basis for the widget.
   */
  export function getSizeBasis(widget: Widget): number {
    return Private.sizeBasisProperty.get(widget);
  }

  /**
   * Set the box layout size basis for the given widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the size basis.
   */
  export function setSizeBasis(widget: Widget, value: number): void {
    Private.sizeBasisProperty.set(widget, value);
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * The property descriptor for a widget stretch factor.
   */
  export const stretchProperty = new AttachedProperty<Widget, number>({
    name: 'stretch',
    create: () => 0,
    coerce: (owner, value) => Math.max(0, Math.floor(value)),
    changed: onChildSizingChanged,
  });

  /**
   * The property descriptor for a widget size basis.
   */
  export const sizeBasisProperty = new AttachedProperty<Widget, number>({
    name: 'sizeBasis',
    create: () => 0,
    coerce: (owner, value) => Math.max(0, Math.floor(value)),
    changed: onChildSizingChanged,
  });

  /**
   * Test whether a direction has horizontal orientation.
   */
  export function isHorizontal(dir: BoxLayout.Direction): boolean {
    return dir === 'left-to-right' || dir === 'right-to-left';
  }

  /**
   * Clamp a spacing value to an integer >= 0.
   */
  export function clampSpacing(value: number): number {
    return Math.max(0, Math.floor(value));
  }

  /**
   * The change handler for the attached sizing properties.
   */
  function onChildSizingChanged(child: Widget): void {
    if (child.parent && child.parent.layout instanceof BoxLayout) {
      child.parent.fit();
    }
  }
}
