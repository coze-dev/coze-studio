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
import { MessageLoop } from '../messaging';
import { Widget } from './widget';
import { Layout } from './layout';

/**
 * A concrete layout implementation which holds a single widget.
 *
 * #### Notes
 * This class is useful for creating simple container widgets which
 * hold a single child. The child should be positioned with CSS.
 */
export class SingletonLayout extends Layout {
  /**
   * Dispose of the resources held by the layout.
   */
  dispose(): void {
    if (this._widget) {
      const widget = this._widget;
      this._widget = null;
      widget.dispose();
    }
    super.dispose();
  }

  /**
   * Get the child widget for the layout.
   */
  get widget(): Widget | null {
    return this._widget;
  }

  /**
   * Set the child widget for the layout.
   *
   * #### Notes
   * Setting the child widget will cause the old child widget to be
   * automatically disposed. If that is not desired, set the parent
   * of the old child to `null` before assigning a new child.
   */
  set widget(widget: Widget | null) {
    // Remove the widget from its current parent. This is a no-op
    // if the widget's parent is already the layout parent widget.
    if (widget) {
      widget.parent = this.parent;
    }

    // Bail early if the widget does not change.
    if (this._widget === widget) {
      return;
    }

    // Dispose of the old child widget.
    if (this._widget) {
      this._widget.dispose();
    }

    // Update the internal widget.
    this._widget = widget;

    // Attach the new child widget if needed.
    if (this.parent && widget) {
      this.attachWidget(widget);
    }
  }

  /**
   * Create an iterator over the widgets in the layout.
   *
   * @returns A new iterator over the widgets in the layout.
   */
  *[Symbol.iterator](): IterableIterator<Widget> {
    if (this._widget) {
      yield this._widget;
    }
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
    // Bail early if the widget does not exist in the layout.
    if (this._widget !== widget) {
      return;
    }

    // Clear the internal widget.
    this._widget = null;

    // If the layout is parented, detach the widget from the DOM.
    if (this.parent) {
      this.detachWidget(widget);
    }
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
   * @param index - The current index of the widget in the layout.
   *
   * @param widget - The widget to attach to the parent.
   *
   * #### Notes
   * This method is called automatically by the single layout at the
   * appropriate time. It should not be called directly by user code.
   *
   * The default implementation adds the widgets's node to the parent's
   * node at the proper location, and sends the appropriate attach
   * messages to the widget if the parent is attached to the DOM.
   *
   * Subclasses may reimplement this method to control how the widget's
   * node is added to the parent's node.
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
  }

  /**
   * Detach a widget from the parent's DOM node.
   *
   * @param widget - The widget to detach from the parent.
   *
   * #### Notes
   * This method is called automatically by the single layout at the
   * appropriate time. It should not be called directly by user code.
   *
   * The default implementation removes the widget's node from the
   * parent's node, and sends the appropriate detach messages to the
   * widget if the parent is attached to the DOM.
   *
   * Subclasses may reimplement this method to control how the widget's
   * node is removed from the parent's node.
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
  }

  private _widget: Widget | null = null;
}
