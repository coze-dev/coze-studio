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
import { type IDisposable } from '../disposable';
import { ArrayExt, find, max } from '../algorithm';
import { type Widget } from './widget';

/**
 * A class which tracks focus among a set of widgets.
 *
 * This class is useful when code needs to keep track of the most
 * recently focused widget(s) among a set of related widgets.
 */
export class FocusTracker<T extends Widget> implements IDisposable {
  /**
   * Dispose of the resources held by the tracker.
   */
  dispose(): void {
    // Do nothing if the tracker is already disposed.
    if (this._counter < 0) {
      return;
    }

    // Mark the tracker as disposed.
    this._counter = -1;

    // Clear the connections for the tracker.
    Signal.clearData(this);

    // Remove all event listeners.
    for (const widget of this._widgets) {
      widget.node.removeEventListener('focus', this, true);
      widget.node.removeEventListener('blur', this, true);
    }

    // Clear the internal data structures.
    this._activeWidget = null;
    this._currentWidget = null;
    this._nodes.clear();
    this._numbers.clear();
    this._widgets.length = 0;
  }

  /**
   * A signal emitted when the current widget has changed.
   */
  get currentChanged(): ISignal<this, FocusTracker.IChangedArgs<T>> {
    return this._currentChanged;
  }

  /**
   * A signal emitted when the active widget has changed.
   */
  get activeChanged(): ISignal<this, FocusTracker.IChangedArgs<T>> {
    return this._activeChanged;
  }

  /**
   * A flag indicating whether the tracker is disposed.
   */
  get isDisposed(): boolean {
    return this._counter < 0;
  }

  /**
   * The current widget in the tracker.
   *
   * #### Notes
   * The current widget is the widget among the tracked widgets which
   * has the *descendant node* which has most recently been focused.
   *
   * The current widget will not be updated if the node loses focus. It
   * will only be updated when a different tracked widget gains focus.
   *
   * If the current widget is removed from the tracker, the previous
   * current widget will be restored.
   *
   * This behavior is intended to follow a user's conceptual model of
   * a semantically "current" widget, where the "last thing of type X"
   * to be interacted with is the "current instance of X", regardless
   * of whether that instance still has focus.
   */
  get currentWidget(): T | null {
    return this._currentWidget;
  }

  /**
   * The active widget in the tracker.
   *
   * #### Notes
   * The active widget is the widget among the tracked widgets which
   * has the *descendant node* which is currently focused.
   */
  get activeWidget(): T | null {
    return this._activeWidget;
  }

  /**
   * A read only array of the widgets being tracked.
   */
  get widgets(): ReadonlyArray<T> {
    return this._widgets;
  }

  /**
   * Get the focus number for a particular widget in the tracker.
   *
   * @param widget - The widget of interest.
   *
   * @returns The focus number for the given widget, or `-1` if the
   *   widget has not had focus since being added to the tracker, or
   *   is not contained by the tracker.
   *
   * #### Notes
   * The focus number indicates the relative order in which the widgets
   * have gained focus. A widget with a larger number has gained focus
   * more recently than a widget with a smaller number.
   *
   * The `currentWidget` will always have the largest focus number.
   *
   * All widgets start with a focus number of `-1`, which indicates that
   * the widget has not been focused since being added to the tracker.
   */
  focusNumber(widget: T): number {
    const n = this._numbers.get(widget);
    return n === undefined ? -1 : n;
  }

  /**
   * Test whether the focus tracker contains a given widget.
   *
   * @param widget - The widget of interest.
   *
   * @returns `true` if the widget is tracked, `false` otherwise.
   */
  has(widget: T): boolean {
    return this._numbers.has(widget);
  }

  /**
   * Add a widget to the focus tracker.
   *
   * @param widget - The widget of interest.
   *
   * #### Notes
   * A widget will be automatically removed from the tracker if it
   * is disposed after being added.
   *
   * If the widget is already tracked, this is a no-op.
   */
  add(widget: T): void {
    // Do nothing if the widget is already tracked.
    if (this._numbers.has(widget)) {
      return;
    }

    // Test whether the widget has focus.
    const focused = widget.node.contains(document.activeElement);

    // Set up the initial focus number.
    const n = focused ? this._counter++ : -1;

    // Add the widget to the internal data structures.
    this._widgets.push(widget);
    this._numbers.set(widget, n);
    this._nodes.set(widget.node, widget);

    // Set up the event listeners. The capturing phase must be used
    // since the 'focus' and 'blur' events don't bubble and Firefox
    // doesn't support the 'focusin' or 'focusout' events.
    widget.node.addEventListener('focus', this, true);
    widget.node.addEventListener('blur', this, true);

    // Connect the disposed signal handler.
    widget.disposed.connect(this._onWidgetDisposed, this);

    // Set the current and active widgets if needed.
    if (focused) {
      this._setWidgets(widget, widget);
    }
  }

  /**
   * Remove a widget from the focus tracker.
   *
   * #### Notes
   * If the widget is the `currentWidget`, the previous current widget
   * will become the new `currentWidget`.
   *
   * A widget will be automatically removed from the tracker if it
   * is disposed after being added.
   *
   * If the widget is not tracked, this is a no-op.
   */
  remove(widget: T): void {
    // Bail early if the widget is not tracked.
    if (!this._numbers.has(widget)) {
      return;
    }

    // Disconnect the disposed signal handler.
    widget.disposed.disconnect(this._onWidgetDisposed, this);

    // Remove the event listeners.
    widget.node.removeEventListener('focus', this, true);
    widget.node.removeEventListener('blur', this, true);

    // Remove the widget from the internal data structures.
    ArrayExt.removeFirstOf(this._widgets, widget);
    this._nodes.delete(widget.node);
    this._numbers.delete(widget);

    // Bail early if the widget is not the current widget.
    if (this._currentWidget !== widget) {
      return;
    }

    // Filter the widgets for those which have had focus.
    const valid = this._widgets.filter(w => this._numbers.get(w) !== -1);

    // Get the valid widget with the max focus number.
    const previous =
      max(valid, (first, second) => {
        const a = this._numbers.get(first)!;
        const b = this._numbers.get(second)!;
        return a - b;
      }) || null;

    // Set the current and active widgets.
    this._setWidgets(previous, null);
  }

  /**
   * Handle the DOM events for the focus tracker.
   *
   * @param event - The DOM event sent to the panel.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the tracked nodes. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'focus':
        this._evtFocus(event as FocusEvent);
        break;
      case 'blur':
        this._evtBlur(event as FocusEvent);
        break;
      default:
        break;
    }
  }

  /**
   * Set the current and active widgets for the tracker.
   */
  private _setWidgets(current: T | null, active: T | null): void {
    // Swap the current widget.
    const oldCurrent = this._currentWidget;
    this._currentWidget = current;

    // Swap the active widget.
    const oldActive = this._activeWidget;
    this._activeWidget = active;

    // Emit the `currentChanged` signal if needed.
    if (oldCurrent !== current) {
      this._currentChanged.emit({ oldValue: oldCurrent, newValue: current });
    }

    // Emit the `activeChanged` signal if needed.
    if (oldActive !== active) {
      this._activeChanged.emit({ oldValue: oldActive, newValue: active });
    }
  }

  /**
   * Handle the `'focus'` event for a tracked widget.
   */
  private _evtFocus(event: FocusEvent): void {
    // Find the widget which gained focus, which is known to exist.
    const widget = this._nodes.get(event.currentTarget as HTMLElement)!;

    // Update the focus number if necessary.
    if (widget !== this._currentWidget) {
      this._numbers.set(widget, this._counter++);
    }

    // Set the current and active widgets.
    this._setWidgets(widget, widget);
  }

  /**
   * Handle the `'blur'` event for a tracked widget.
   */
  private _evtBlur(event: FocusEvent): void {
    // Find the widget which lost focus, which is known to exist.
    const widget = this._nodes.get(event.currentTarget as HTMLElement)!;

    // Get the node which being focused after this blur.
    const focusTarget = event.relatedTarget as HTMLElement;

    // If no other node is being focused, clear the active widget.
    if (!focusTarget) {
      this._setWidgets(this._currentWidget, null);
      return;
    }

    // Bail if the focus widget is not changing.
    if (widget.node.contains(focusTarget)) {
      return;
    }

    // If no tracked widget is being focused, clear the active widget.
    if (!find(this._widgets, w => w.node.contains(focusTarget))) {
      this._setWidgets(this._currentWidget, null);
      return;
    }
  }

  /**
   * Handle the `disposed` signal for a tracked widget.
   */
  private _onWidgetDisposed(sender: T): void {
    this.remove(sender);
  }

  private _counter = 0;

  private _widgets: T[] = [];

  private _activeWidget: T | null = null;

  private _currentWidget: T | null = null;

  private _numbers = new Map<T, number>();

  private _nodes = new Map<HTMLElement, T>();

  private _activeChanged = new Signal<this, FocusTracker.IChangedArgs<T>>(this);

  private _currentChanged = new Signal<this, FocusTracker.IChangedArgs<T>>(
    this,
  );
}

/**
 * The namespace for the `FocusTracker` class statics.
 */
export namespace FocusTracker {
  /**
   * An arguments object for the changed signals.
   */
  export interface IChangedArgs<T extends Widget> {
    /**
     * The old value for the widget.
     */
    oldValue: T | null;

    /**
     * The new value for the widget.
     */
    newValue: T | null;
  }
}
