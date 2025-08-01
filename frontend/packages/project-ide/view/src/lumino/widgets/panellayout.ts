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
import { ArrayExt } from '../algorithm';
import { Widget } from './widget';
import { Layout } from './layout';

/**
 * A concrete layout implementation suitable for many use cases.
 *
 * #### Notes
 * This class is suitable as a base class for implementing a variety of
 * layouts, but can also be used directly with standard CSS to layout a
 * collection of widgets.
 */
export class PanelLayout extends Layout {
  /**
   * Dispose of the resources held by the layout.
   *
   * #### Notes
   * This will clear and dispose all widgets in the layout.
   *
   * All reimplementations should call the superclass method.
   *
   * This method is called automatically when the parent is disposed.
   */
  dispose(): void {
    while (this._widgets.length > 0) {
      this._widgets.pop()!.dispose();
    }
    super.dispose();
  }

  /**
   * A read-only array of the widgets in the layout.
   */
  get widgets(): ReadonlyArray<Widget> {
    return this._widgets;
  }

  /**
   * Create an iterator over the widgets in the layout.
   *
   * @returns A new iterator over the widgets in the layout.
   */
  *[Symbol.iterator](): IterableIterator<Widget> {
    yield* this._widgets;
  }

  /**
   * Add a widget to the end of the layout.
   *
   * @param widget - The widget to add to the layout.
   *
   * #### Notes
   * If the widget is already contained in the layout, it will be moved.
   */
  addWidget(widget: Widget): void {
    this.insertWidget(this._widgets.length, widget);
  }

  /**
   * Insert a widget into the layout at the specified index.
   *
   * @param index - The index at which to insert the widget.
   *
   * @param widget - The widget to insert into the layout.
   *
   * #### Notes
   * The index will be clamped to the bounds of the widgets.
   *
   * If the widget is already added to the layout, it will be moved.
   *
   * #### Undefined Behavior
   * An `index` which is non-integral.
   */
  insertWidget(index: number, widget: Widget): void {
    // Remove the widget from its current parent. This is a no-op
    // if the widget's parent is already the layout parent widget.
    widget.parent = this.parent;

    // Look up the current index of the widget.
    const i = this._widgets.indexOf(widget);

    // Clamp the insert index to the array bounds.
    let j = Math.max(0, Math.min(index, this._widgets.length));

    // If the widget is not in the array, insert it.
    if (i === -1) {
      // Insert the widget into the array.
      ArrayExt.insert(this._widgets, j, widget);

      // If the layout is parented, attach the widget to the DOM.
      if (this.parent) {
        this.attachWidget(j, widget);
      }

      // There is nothing more to do.
      return;
    }

    // Otherwise, the widget exists in the array and should be moved.

    // Adjust the index if the location is at the end of the array.
    if (j === this._widgets.length) {
      j--;
    }

    // Bail if there is no effective move.
    if (i === j) {
      return;
    }

    // Move the widget to the new location.
    ArrayExt.move(this._widgets, i, j);

    // If the layout is parented, move the widget in the DOM.
    if (this.parent) {
      this.moveWidget(i, j, widget);
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
    this.removeWidgetAt(this._widgets.indexOf(widget));
  }

  /**
   * Remove the widget at a given index from the layout.
   *
   * @param index - The index of the widget to remove.
   *
   * #### Notes
   * A widget is automatically removed from the layout when its `parent`
   * is set to `null`. This method should only be invoked directly when
   * removing a widget from a layout which has yet to be installed on a
   * parent widget.
   *
   * This method does *not* modify the widget's `parent`.
   *
   * #### Undefined Behavior
   * An `index` which is non-integral.
   */
  removeWidgetAt(index: number): void {
    // Remove the widget from the array.
    const widget = ArrayExt.removeAt(this._widgets, index);

    // If the layout is parented, detach the widget from the DOM.
    if (widget && this.parent) {
      this.detachWidget(index, widget);
    }
  }

  /**
   * Perform layout initialization which requires the parent widget.
   */
  protected init(): void {
    super.init();
    let index = 0;
    for (const widget of this) {
      this.attachWidget(index++, widget);
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
   * This method is called automatically by the panel layout at the
   * appropriate time. It should not be called directly by user code.
   *
   * The default implementation adds the widgets's node to the parent's
   * node at the proper location, and sends the appropriate attach
   * messages to the widget if the parent is attached to the DOM.
   *
   * Subclasses may reimplement this method to control how the widget's
   * node is added to the parent's node.
   */
  protected attachWidget(index: number, widget: Widget): void {
    // Look up the next sibling reference node.
    const ref = this.parent!.node.children[index];

    // Send a `'before-attach'` message if the parent is attached.
    if (this.parent!.isAttached) {
      MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
    }

    // Insert the widget's node before the sibling.
    this.parent!.node.insertBefore(widget.node, ref);

    // Send an `'after-attach'` message if the parent is attached.
    if (this.parent!.isAttached) {
      MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
    }
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
   * This method is called automatically by the panel layout at the
   * appropriate time. It should not be called directly by user code.
   *
   * The default implementation moves the widget's node to the proper
   * location in the parent's node and sends the appropriate attach and
   * detach messages to the widget if the parent is attached to the DOM.
   *
   * Subclasses may reimplement this method to control how the widget's
   * node is moved in the parent's node.
   */
  protected moveWidget(
    fromIndex: number,
    toIndex: number,
    widget: Widget,
  ): void {
    // Send a `'before-detach'` message if the parent is attached.
    if (this.parent!.isAttached) {
      MessageLoop.sendMessage(widget, Widget.Msg.BeforeDetach);
    }

    // Remove the widget's node from the parent.
    this.parent!.node.removeChild(widget.node);

    // Send an `'after-detach'` and  message if the parent is attached.
    if (this.parent!.isAttached) {
      MessageLoop.sendMessage(widget, Widget.Msg.AfterDetach);
    }

    // Look up the next sibling reference node.
    const ref = this.parent!.node.children[toIndex];

    // Send a `'before-attach'` message if the parent is attached.
    if (this.parent!.isAttached) {
      MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
    }

    // Insert the widget's node before the sibling.
    this.parent!.node.insertBefore(widget.node, ref);

    // Send an `'after-attach'` message if the parent is attached.
    if (this.parent!.isAttached) {
      MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
    }
  }

  /**
   * Detach a widget from the parent's DOM node.
   *
   * @param index - The previous index of the widget in the layout.
   *
   * @param widget - The widget to detach from the parent.
   *
   * #### Notes
   * This method is called automatically by the panel layout at the
   * appropriate time. It should not be called directly by user code.
   *
   * The default implementation removes the widget's node from the
   * parent's node, and sends the appropriate detach messages to the
   * widget if the parent is attached to the DOM.
   *
   * Subclasses may reimplement this method to control how the widget's
   * node is removed from the parent's node.
   */
  protected detachWidget(index: number, widget: Widget): void {
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

  private _widgets: Widget[] = [];
}
