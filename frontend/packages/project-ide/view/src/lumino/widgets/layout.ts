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
import { Signal } from '../signaling';
import { AttachedProperty } from '../properties';
import { type Message, MessageLoop } from '../messaging';
import { ElementExt } from '../domutils';
import { type IDisposable } from '../disposable';
import { Widget } from './widget';

/**
 * An abstract base class for creating lumino layouts.
 *
 * #### Notes
 * A layout is used to add widgets to a parent and to arrange those
 * widgets within the parent's DOM node.
 *
 * This class implements the base functionality which is required of
 * nearly all layouts. It must be subclassed in order to be useful.
 *
 * Notably, this class does not define a uniform interface for adding
 * widgets to the layout. A subclass should define that API in a way
 * which is meaningful for its intended use.
 */
export abstract class Layout implements Iterable<Widget>, IDisposable {
  /**
   * Construct a new layout.
   *
   * @param options - The options for initializing the layout.
   */
  constructor(options: Layout.IOptions = {}) {
    this._fitPolicy = options.fitPolicy || 'set-min-size';
  }

  /**
   * Dispose of the resources held by the layout.
   *
   * #### Notes
   * This should be reimplemented to clear and dispose of the widgets.
   *
   * All reimplementations should call the superclass method.
   *
   * This method is called automatically when the parent is disposed.
   */
  dispose(): void {
    this._parent = null;
    this._disposed = true;
    Signal.clearData(this);
    AttachedProperty.clearData(this);
  }

  /**
   * Test whether the layout is disposed.
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Get the parent widget of the layout.
   */
  get parent(): Widget | null {
    return this._parent;
  }

  /**
   * Set the parent widget of the layout.
   *
   * #### Notes
   * This is set automatically when installing the layout on the parent
   * widget. The parent widget should not be set directly by user code.
   */
  set parent(value: Widget | null) {
    if (this._parent === value) {
      return;
    }
    if (this._parent) {
      throw new Error('Cannot change parent widget.');
    }
    if (value!.layout !== this) {
      throw new Error('Invalid parent widget.');
    }
    this._parent = value;
    this.init();
  }

  /**
   * Get the fit policy for the layout.
   *
   * #### Notes
   * The fit policy controls the computed size constraints which are
   * applied to the parent widget by the layout.
   *
   * Some layout implementations may ignore the fit policy.
   */
  get fitPolicy(): Layout.FitPolicy {
    return this._fitPolicy;
  }

  /**
   * Set the fit policy for the layout.
   *
   * #### Notes
   * The fit policy controls the computed size constraints which are
   * applied to the parent widget by the layout.
   *
   * Some layout implementations may ignore the fit policy.
   *
   * Changing the fit policy will clear the current size constraint
   * for the parent widget and then re-fit the parent.
   */
  set fitPolicy(value: Layout.FitPolicy) {
    // Bail if the policy does not change
    if (this._fitPolicy === value) {
      return;
    }

    // Update the internal policy.
    this._fitPolicy = value;

    // Clear the size constraints and schedule a fit of the parent.
    if (this._parent) {
      const { style } = this._parent.node;
      style.minWidth = '';
      style.minHeight = '';
      style.maxWidth = '';
      style.maxHeight = '';
      this._parent.fit();
    }
  }

  /**
   * Create an iterator over the widgets in the layout.
   *
   * @returns A new iterator over the widgets in the layout.
   *
   * #### Notes
   * This abstract method must be implemented by a subclass.
   */
  abstract [Symbol.iterator](): IterableIterator<Widget>;

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
   * This method should *not* modify the widget's `parent`.
   */
  abstract removeWidget(widget: Widget): void;

  /**
   * Process a message sent to the parent widget.
   *
   * @param msg - The message sent to the parent widget.
   *
   * #### Notes
   * This method is called by the parent widget to process a message.
   *
   * Subclasses may reimplement this method as needed.
   */
  processParentMessage(msg: Message): void {
    switch (msg.type) {
      case 'resize':
        this.onResize(msg as Widget.ResizeMessage);
        break;
      case 'update-request':
        this.onUpdateRequest(msg);
        break;
      case 'fit-request':
        this.onFitRequest(msg);
        break;
      case 'before-show':
        this.onBeforeShow(msg);
        break;
      case 'after-show':
        this.onAfterShow(msg);
        break;
      case 'before-hide':
        this.onBeforeHide(msg);
        break;
      case 'after-hide':
        this.onAfterHide(msg);
        break;
      case 'before-attach':
        this.onBeforeAttach(msg);
        break;
      case 'after-attach':
        this.onAfterAttach(msg);
        break;
      case 'before-detach':
        this.onBeforeDetach(msg);
        break;
      case 'after-detach':
        this.onAfterDetach(msg);
        break;
      case 'child-removed':
        this.onChildRemoved(msg as Widget.ChildMessage);
        break;
      case 'child-shown':
        this.onChildShown(msg as Widget.ChildMessage);
        break;
      case 'child-hidden':
        this.onChildHidden(msg as Widget.ChildMessage);
        break;
    }
  }

  /**
   * Perform layout initialization which requires the parent widget.
   *
   * #### Notes
   * This method is invoked immediately after the layout is installed
   * on the parent widget.
   *
   * The default implementation reparents all of the widgets to the
   * layout parent widget.
   *
   * Subclasses should reimplement this method and attach the child
   * widget nodes to the parent widget's node.
   */
  protected init(): void {
    for (const widget of this) {
      widget.parent = this.parent;
    }
  }

  /**
   * A message handler invoked on a `'resize'` message.
   *
   * #### Notes
   * The layout should ensure that its widgets are resized according
   * to the specified layout space, and that they are sent a `'resize'`
   * message if appropriate.
   *
   * The default implementation of this method sends an `UnknownSize`
   * resize message to all widgets.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onResize(msg: Widget.ResizeMessage): void {
    for (const widget of this) {
      MessageLoop.sendMessage(widget, Widget.ResizeMessage.UnknownSize);
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   *
   * #### Notes
   * The layout should ensure that its widgets are resized according
   * to the available layout space, and that they are sent a `'resize'`
   * message if appropriate.
   *
   * The default implementation of this method sends an `UnknownSize`
   * resize message to all widgets.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onUpdateRequest(msg: Message): void {
    for (const widget of this) {
      MessageLoop.sendMessage(widget, Widget.ResizeMessage.UnknownSize);
    }
  }

  /**
   * A message handler invoked on a `'before-attach'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all widgets. It assumes all widget nodes are attached to the
   * parent widget node.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onBeforeAttach(msg: Message): void {
    for (const widget of this) {
      MessageLoop.sendMessage(widget, msg);
    }
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all widgets. It assumes all widget nodes are attached to the
   * parent widget node.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onAfterAttach(msg: Message): void {
    for (const widget of this) {
      MessageLoop.sendMessage(widget, msg);
    }
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all widgets. It assumes all widget nodes are attached to the
   * parent widget node.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onBeforeDetach(msg: Message): void {
    for (const widget of this) {
      MessageLoop.sendMessage(widget, msg);
    }
  }

  /**
   * A message handler invoked on an `'after-detach'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message
   * to all widgets. It assumes all widget nodes are attached to the
   * parent widget node.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onAfterDetach(msg: Message): void {
    for (const widget of this) {
      MessageLoop.sendMessage(widget, msg);
    }
  }

  /**
   * A message handler invoked on a `'before-show'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message to
   * all non-hidden widgets. It assumes all widget nodes are attached
   * to the parent widget node.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onBeforeShow(msg: Message): void {
    for (const widget of this) {
      if (!widget.isHidden) {
        MessageLoop.sendMessage(widget, msg);
      }
    }
  }

  /**
   * A message handler invoked on an `'after-show'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message to
   * all non-hidden widgets. It assumes all widget nodes are attached
   * to the parent widget node.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onAfterShow(msg: Message): void {
    for (const widget of this) {
      if (!widget.isHidden) {
        MessageLoop.sendMessage(widget, msg);
      }
    }
  }

  /**
   * A message handler invoked on a `'before-hide'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message to
   * all non-hidden widgets. It assumes all widget nodes are attached
   * to the parent widget node.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onBeforeHide(msg: Message): void {
    for (const widget of this) {
      if (!widget.isHidden) {
        MessageLoop.sendMessage(widget, msg);
      }
    }
  }

  /**
   * A message handler invoked on an `'after-hide'` message.
   *
   * #### Notes
   * The default implementation of this method forwards the message to
   * all non-hidden widgets. It assumes all widget nodes are attached
   * to the parent widget node.
   *
   * This may be reimplemented by subclasses as needed.
   */
  protected onAfterHide(msg: Message): void {
    for (const widget of this) {
      if (!widget.isHidden) {
        MessageLoop.sendMessage(widget, msg);
      }
    }
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   *
   * #### Notes
   * This will remove the child widget from the layout.
   *
   * Subclasses should **not** typically reimplement this method.
   */
  protected onChildRemoved(msg: Widget.ChildMessage): void {
    this.removeWidget(msg.child);
  }

  /**
   * A message handler invoked on a `'fit-request'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onFitRequest(msg: Message): void {}

  /**
   * A message handler invoked on a `'child-shown'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onChildShown(msg: Widget.ChildMessage): void {}

  /**
   * A message handler invoked on a `'child-hidden'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onChildHidden(msg: Widget.ChildMessage): void {}

  private _disposed = false;

  private _fitPolicy: Layout.FitPolicy;

  private _parent: Widget | null = null;
}

/**
 * The namespace for the `Layout` class statics.
 */
export namespace Layout {
  /**
   * A type alias for the layout fit policy.
   *
   * #### Notes
   * The fit policy controls the computed size constraints which are
   * applied to the parent widget by the layout.
   *
   * Some layout implementations may ignore the fit policy.
   */
  export type FitPolicy =
    | /**
     * No size constraint will be applied to the parent widget.
     */
    'set-no-constraint'

    /**
     * The computed min size will be applied to the parent widget.
     */
    | 'set-min-size';

  /**
   * An options object for initializing a layout.
   */
  export interface IOptions {
    /**
     * The fit policy for the layout.
     *
     * The default is `'set-min-size'`.
     */
    fitPolicy?: FitPolicy;
  }

  /**
   * A type alias for the horizontal alignment of a widget.
   */
  export type HorizontalAlignment = 'left' | 'center' | 'right';

  /**
   * A type alias for the vertical alignment of a widget.
   */
  export type VerticalAlignment = 'top' | 'center' | 'bottom';

  /**
   * Get the horizontal alignment for a widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The horizontal alignment for the widget.
   *
   * #### Notes
   * If the layout width allocated to a widget is larger than its max
   * width, the horizontal alignment controls how the widget is placed
   * within the extra horizontal space.
   *
   * If the allocated width is less than the widget's max width, the
   * horizontal alignment has no effect.
   *
   * Some layout implementations may ignore horizontal alignment.
   */
  export function getHorizontalAlignment(widget: Widget): HorizontalAlignment {
    return Private.horizontalAlignmentProperty.get(widget);
  }

  /**
   * Set the horizontal alignment for a widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the horizontal alignment.
   *
   * #### Notes
   * If the layout width allocated to a widget is larger than its max
   * width, the horizontal alignment controls how the widget is placed
   * within the extra horizontal space.
   *
   * If the allocated width is less than the widget's max width, the
   * horizontal alignment has no effect.
   *
   * Some layout implementations may ignore horizontal alignment.
   *
   * Changing the horizontal alignment will post an `update-request`
   * message to widget's parent, provided the parent has a layout
   * installed.
   */
  export function setHorizontalAlignment(
    widget: Widget,
    value: HorizontalAlignment,
  ): void {
    Private.horizontalAlignmentProperty.set(widget, value);
  }

  /**
   * Get the vertical alignment for a widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns The vertical alignment for the widget.
   *
   * #### Notes
   * If the layout height allocated to a widget is larger than its max
   * height, the vertical alignment controls how the widget is placed
   * within the extra vertical space.
   *
   * If the allocated height is less than the widget's max height, the
   * vertical alignment has no effect.
   *
   * Some layout implementations may ignore vertical alignment.
   */
  export function getVerticalAlignment(widget: Widget): VerticalAlignment {
    return Private.verticalAlignmentProperty.get(widget);
  }

  /**
   * Set the vertical alignment for a widget.
   *
   * @param widget - The widget of interest.
   *
   * @param value - The value for the vertical alignment.
   *
   * #### Notes
   * If the layout height allocated to a widget is larger than its max
   * height, the vertical alignment controls how the widget is placed
   * within the extra vertical space.
   *
   * If the allocated height is less than the widget's max height, the
   * vertical alignment has no effect.
   *
   * Some layout implementations may ignore vertical alignment.
   *
   * Changing the horizontal alignment will post an `update-request`
   * message to widget's parent, provided the parent has a layout
   * installed.
   */
  export function setVerticalAlignment(
    widget: Widget,
    value: VerticalAlignment,
  ): void {
    Private.verticalAlignmentProperty.set(widget, value);
  }
}

/**
 * An object which assists in the absolute layout of widgets.
 *
 * #### Notes
 * This class is useful when implementing a layout which arranges its
 * widgets using absolute positioning.
 *
 * This class is used by nearly all of the built-in lumino layouts.
 */
export class LayoutItem implements IDisposable {
  /**
   * Construct a new layout item.
   *
   * @param widget - The widget to be managed by the item.
   *
   * #### Notes
   * The widget will be set to absolute positioning.
   * The widget will use strict CSS containment.
   */
  constructor(widget: Widget) {
    this.widget = widget;
    this.widget.node.style.position = 'absolute';
    this.widget.node.style.contain = 'strict';
  }

  /**
   * Dispose of the the layout item.
   *
   * #### Notes
   * This will reset the positioning of the widget.
   */
  dispose(): void {
    // Do nothing if the item is already disposed.
    if (this._disposed) {
      return;
    }

    // Mark the item as disposed.
    this._disposed = true;

    // Reset the widget style.
    const { style } = this.widget.node;
    style.position = '';
    style.top = '';
    style.left = '';
    style.width = '';
    style.height = '';
    style.contain = '';
  }

  /**
   * The widget managed by the layout item.
   */
  readonly widget: Widget;

  /**
   * The computed minimum width of the widget.
   *
   * #### Notes
   * This value can be updated by calling the `fit` method.
   */
  get minWidth(): number {
    return this._minWidth;
  }

  /**
   * The computed minimum height of the widget.
   *
   * #### Notes
   * This value can be updated by calling the `fit` method.
   */
  get minHeight(): number {
    return this._minHeight;
  }

  /**
   * The computed maximum width of the widget.
   *
   * #### Notes
   * This value can be updated by calling the `fit` method.
   */
  get maxWidth(): number {
    return this._maxWidth;
  }

  /**
   * The computed maximum height of the widget.
   *
   * #### Notes
   * This value can be updated by calling the `fit` method.
   */
  get maxHeight(): number {
    return this._maxHeight;
  }

  /**
   * Whether the layout item is disposed.
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Whether the managed widget is hidden.
   */
  get isHidden(): boolean {
    return this.widget.isHidden;
  }

  /**
   * Whether the managed widget is visible.
   */
  get isVisible(): boolean {
    return this.widget.isVisible;
  }

  /**
   * Whether the managed widget is attached.
   */
  get isAttached(): boolean {
    return this.widget.isAttached;
  }

  /**
   * Update the computed size limits of the managed widget.
   */
  fit(): void {
    const limits = ElementExt.sizeLimits(this.widget.node);
    this._minWidth = limits.minWidth;
    this._minHeight = limits.minHeight;
    this._maxWidth = limits.maxWidth;
    this._maxHeight = limits.maxHeight;
  }

  /**
   * Update the position and size of the managed widget.
   *
   * @param left - The left edge position of the layout box.
   *
   * @param top - The top edge position of the layout box.
   *
   * @param width - The width of the layout box.
   *
   * @param height - The height of the layout box.
   */
  update(left: number, top: number, width: number, height: number): void {
    // Clamp the size to the computed size limits.
    const clampW = Math.max(this._minWidth, Math.min(width, this._maxWidth));
    const clampH = Math.max(this._minHeight, Math.min(height, this._maxHeight));

    // Adjust the left edge for the horizontal alignment, if needed.
    if (clampW < width) {
      switch (Layout.getHorizontalAlignment(this.widget)) {
        case 'left':
          break;
        case 'center':
          left += (width - clampW) / 2;
          break;
        case 'right':
          left += width - clampW;
          break;
        default:
          throw 'unreachable';
      }
    }

    // Adjust the top edge for the vertical alignment, if needed.
    if (clampH < height) {
      switch (Layout.getVerticalAlignment(this.widget)) {
        case 'top':
          break;
        case 'center':
          top += (height - clampH) / 2;
          break;
        case 'bottom':
          top += height - clampH;
          break;
        default:
          throw 'unreachable';
      }
    }

    // Set up the resize variables.
    let resized = false;
    const { style } = this.widget.node;

    // Update the top edge of the widget if needed.
    if (this._top !== top) {
      this._top = top;
      style.top = `${top}px`;
    }

    // Update the left edge of the widget if needed.
    if (this._left !== left) {
      this._left = left;
      style.left = `${left}px`;
    }

    // Update the width of the widget if needed.
    if (this._width !== clampW) {
      resized = true;
      this._width = clampW;
      style.width = `${clampW}px`;
    }

    // Update the height of the widget if needed.
    if (this._height !== clampH) {
      resized = true;
      this._height = clampH;
      style.height = `${clampH}px`;
    }

    // Send a resize message to the widget if needed.
    if (resized) {
      const msg = new Widget.ResizeMessage(clampW, clampH);
      MessageLoop.sendMessage(this.widget, msg);
    }
  }

  private _top = NaN;

  private _left = NaN;

  private _width = NaN;

  private _height = NaN;

  private _minWidth = 0;

  private _minHeight = 0;

  private _maxWidth = Infinity;

  private _maxHeight = Infinity;

  private _disposed = false;
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * The attached property for a widget horizontal alignment.
   */
  export const horizontalAlignmentProperty = new AttachedProperty<
    Widget,
    Layout.HorizontalAlignment
  >({
    name: 'horizontalAlignment',
    create: () => 'center',
    changed: onAlignmentChanged,
  });

  /**
   * The attached property for a widget vertical alignment.
   */
  export const verticalAlignmentProperty = new AttachedProperty<
    Widget,
    Layout.VerticalAlignment
  >({
    name: 'verticalAlignment',
    create: () => 'top',
    changed: onAlignmentChanged,
  });

  /**
   * The change handler for the attached alignment properties.
   */
  function onAlignmentChanged(child: Widget): void {
    if (child.parent && child.parent.layout) {
      child.parent.update();
    }
  }
}
