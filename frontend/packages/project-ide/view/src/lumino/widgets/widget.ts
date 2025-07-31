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
import {
  ConflatableMessage,
  type IMessageHandler,
  Message,
  MessageLoop,
} from '../messaging';
import { type IObservableDisposable } from '../disposable';
import { Title } from './title';
import { type Layout } from './layout';

/**
 * The base class of the lumino widget hierarchy.
 *
 * #### Notes
 * This class will typically be subclassed in order to create a useful
 * widget. However, it can be used directly to host externally created
 * content.
 */
export class Widget implements IMessageHandler, IObservableDisposable {
  /**
   * Construct a new widget.
   *
   * @param options - The options for initializing the widget.
   */
  constructor(options: Widget.IOptions = {}) {
    this.node = Private.createNode(options);
    this.addClass('lm-Widget');
  }

  /**
   * Dispose of the widget and its descendant widgets.
   *
   * #### Notes
   * It is unsafe to use the widget after it has been disposed.
   *
   * All calls made to this method after the first are a no-op.
   */
  dispose(): void {
    // Do nothing if the widget is already disposed.
    if (this.isDisposed) {
      return;
    }

    // Set the disposed flag and emit the disposed signal.
    this.setFlag(Widget.Flag.IsDisposed);
    this._disposed.emit(undefined);

    // Remove or detach the widget if necessary.
    if (this.parent) {
      this.parent = null;
    } else if (this.isAttached) {
      Widget.detach(this);
    }

    // Dispose of the widget layout.
    if (this._layout) {
      this._layout.dispose();
      this._layout = null;
    }

    // Dispose the title
    this.title.dispose();

    // Clear the extra data associated with the widget.
    Signal.clearData(this);
    MessageLoop.clearData(this);
    AttachedProperty.clearData(this);
  }

  /**
   * A signal emitted when the widget is disposed.
   */
  get disposed(): ISignal<this, void> {
    return this._disposed;
  }

  /**
   * Get the DOM node owned by the widget.
   */
  readonly node: HTMLElement;

  /**
   * Test whether the widget has been disposed.
   */
  get isDisposed(): boolean {
    return this.testFlag(Widget.Flag.IsDisposed);
  }

  /**
   * Test whether the widget's node is attached to the DOM.
   */
  get isAttached(): boolean {
    return this.testFlag(Widget.Flag.IsAttached);
  }

  /**
   * Test whether the widget is explicitly hidden.
   */
  get isHidden(): boolean {
    return this.testFlag(Widget.Flag.IsHidden);
  }

  /**
   * Test whether the widget is visible.
   *
   * #### Notes
   * A widget is visible when it is attached to the DOM, is not
   * explicitly hidden, and has no explicitly hidden ancestors.
   */
  get isVisible(): boolean {
    return this.testFlag(Widget.Flag.IsVisible);
  }

  /**
   * The title object for the widget.
   *
   * #### Notes
   * The title object is used by some container widgets when displaying
   * the widget alongside some title, such as a tab panel or side bar.
   *
   * Since not all widgets will use the title, it is created on demand.
   *
   * The `owner` property of the title is set to this widget.
   */
  get title(): Title<Widget> {
    return Private.titleProperty.get(this);
  }

  /**
   * Get the id of the widget's DOM node.
   */
  get id(): string {
    return this.node.id;
  }

  /**
   * Set the id of the widget's DOM node.
   */
  set id(value: string) {
    this.node.id = value;
  }

  /**
   * The dataset for the widget's DOM node.
   */
  get dataset(): DOMStringMap {
    return this.node.dataset;
  }

  /**
   * Get the method for hiding the widget.
   */
  get hiddenMode(): Widget.HiddenMode {
    return this._hiddenMode;
  }

  /**
   * Set the method for hiding the widget.
   */
  set hiddenMode(value: Widget.HiddenMode) {
    if (this._hiddenMode === value) {
      return;
    }

    if (this.isHidden) {
      // Reset styles set by previous mode.
      this._toggleHidden(false);
    }

    if (value == Widget.HiddenMode.Scale) {
      this.node.style.willChange = 'transform';
    } else {
      this.node.style.willChange = 'auto';
    }

    this._hiddenMode = value;

    if (this.isHidden) {
      // Set styles for new mode.
      this._toggleHidden(true);
    }
  }

  /**
   * Get the parent of the widget.
   */
  get parent(): Widget | null {
    return this._parent;
  }

  /**
   * Set the parent of the widget.
   *
   * #### Notes
   * Children are typically added to a widget by using a layout, which
   * means user code will not normally set the parent widget directly.
   *
   * The widget will be automatically removed from its old parent.
   *
   * This is a no-op if there is no effective parent change.
   */
  set parent(value: Widget | null) {
    if (this._parent === value) {
      return;
    }
    if (value && this.contains(value)) {
      throw new Error('Invalid parent widget.');
    }
    if (this._parent && !this._parent.isDisposed) {
      const msg = new Widget.ChildMessage('child-removed', this);
      MessageLoop.sendMessage(this._parent, msg);
    }
    this._parent = value;
    if (this._parent && !this._parent.isDisposed) {
      const msg = new Widget.ChildMessage('child-added', this);
      MessageLoop.sendMessage(this._parent, msg);
    }
    if (!this.isDisposed) {
      MessageLoop.sendMessage(this, Widget.Msg.ParentChanged);
    }
  }

  /**
   * Get the layout for the widget.
   */
  get layout(): Layout | null {
    return this._layout;
  }

  /**
   * Set the layout for the widget.
   *
   * #### Notes
   * The layout is single-use only. It cannot be changed after the
   * first assignment.
   *
   * The layout is disposed automatically when the widget is disposed.
   */
  set layout(value: Layout | null) {
    if (this._layout === value) {
      return;
    }
    if (this.testFlag(Widget.Flag.DisallowLayout)) {
      throw new Error('Cannot set widget layout.');
    }
    if (this._layout) {
      throw new Error('Cannot change widget layout.');
    }
    if (value!.parent) {
      throw new Error('Cannot change layout parent.');
    }
    this._layout = value;
    value!.parent = this;
  }

  /**
   * Create an iterator over the widget's children.
   *
   * @returns A new iterator over the children of the widget.
   *
   * #### Notes
   * The widget must have a populated layout in order to have children.
   *
   * If a layout is not installed, the returned iterator will be empty.
   */
  *children(): IterableIterator<Widget> {
    if (this._layout) {
      yield* this._layout;
    }
  }

  /**
   * Test whether a widget is a descendant of this widget.
   *
   * @param widget - The descendant widget of interest.
   *
   * @returns `true` if the widget is a descendant, `false` otherwise.
   */
  contains(widget: Widget): boolean {
    for (let value: Widget | null = widget; value; value = value._parent) {
      if (value === this) {
        return true;
      }
    }
    return false;
  }

  /**
   * Test whether the widget's DOM node has the given class name.
   *
   * @param name - The class name of interest.
   *
   * @returns `true` if the node has the class, `false` otherwise.
   */
  hasClass(name: string): boolean {
    return this.node.classList.contains(name);
  }

  /**
   * Add a class name to the widget's DOM node.
   *
   * @param name - The class name to add to the node.
   *
   * #### Notes
   * If the class name is already added to the node, this is a no-op.
   *
   * The class name must not contain whitespace.
   */
  addClass(name: string): void {
    this.node.classList.add(name);
  }

  /**
   * Remove a class name from the widget's DOM node.
   *
   * @param name - The class name to remove from the node.
   *
   * #### Notes
   * If the class name is not yet added to the node, this is a no-op.
   *
   * The class name must not contain whitespace.
   */
  removeClass(name: string): void {
    this.node.classList.remove(name);
  }

  /**
   * Toggle a class name on the widget's DOM node.
   *
   * @param name - The class name to toggle on the node.
   *
   * @param force - Whether to force add the class (`true`) or force
   *   remove the class (`false`). If not provided, the presence of
   *   the class will be toggled from its current state.
   *
   * @returns `true` if the class is now present, `false` otherwise.
   *
   * #### Notes
   * The class name must not contain whitespace.
   */
  toggleClass(name: string, force?: boolean): boolean {
    if (force === true) {
      this.node.classList.add(name);
      return true;
    }
    if (force === false) {
      this.node.classList.remove(name);
      return false;
    }
    return this.node.classList.toggle(name);
  }

  /**
   * Post an `'update-request'` message to the widget.
   *
   * #### Notes
   * This is a simple convenience method for posting the message.
   */
  update(): void {
    MessageLoop.postMessage(this, Widget.Msg.UpdateRequest);
  }

  /**
   * Post a `'fit-request'` message to the widget.
   *
   * #### Notes
   * This is a simple convenience method for posting the message.
   */
  fit(): void {
    MessageLoop.postMessage(this, Widget.Msg.FitRequest);
  }

  /**
   * Post an `'activate-request'` message to the widget.
   *
   * #### Notes
   * This is a simple convenience method for posting the message.
   */
  activate(): void {
    MessageLoop.postMessage(this, Widget.Msg.ActivateRequest);
  }

  /**
   * Send a `'close-request'` message to the widget.
   *
   * #### Notes
   * This is a simple convenience method for sending the message.
   */
  close(): void {
    MessageLoop.sendMessage(this, Widget.Msg.CloseRequest);
  }

  /**
   * Show the widget and make it visible to its parent widget.
   *
   * #### Notes
   * This causes the {@link isHidden} property to be `false`.
   *
   * If the widget is not explicitly hidden, this is a no-op.
   */
  show(): void {
    if (!this.testFlag(Widget.Flag.IsHidden)) {
      return;
    }
    if (this.isAttached && (!this.parent || this.parent.isVisible)) {
      MessageLoop.sendMessage(this, Widget.Msg.BeforeShow);
    }
    this.clearFlag(Widget.Flag.IsHidden);
    this._toggleHidden(false);

    if (this.isAttached && (!this.parent || this.parent.isVisible)) {
      MessageLoop.sendMessage(this, Widget.Msg.AfterShow);
    }
    if (this.parent) {
      const msg = new Widget.ChildMessage('child-shown', this);
      MessageLoop.sendMessage(this.parent, msg);
    }
  }

  /**
   * Hide the widget and make it hidden to its parent widget.
   *
   * #### Notes
   * This causes the {@link isHidden} property to be `true`.
   *
   * If the widget is explicitly hidden, this is a no-op.
   */
  hide(): void {
    if (this.testFlag(Widget.Flag.IsHidden)) {
      return;
    }
    if (this.isAttached && (!this.parent || this.parent.isVisible)) {
      MessageLoop.sendMessage(this, Widget.Msg.BeforeHide);
    }
    this.setFlag(Widget.Flag.IsHidden);
    this._toggleHidden(true);

    if (this.isAttached && (!this.parent || this.parent.isVisible)) {
      MessageLoop.sendMessage(this, Widget.Msg.AfterHide);
    }
    if (this.parent) {
      const msg = new Widget.ChildMessage('child-hidden', this);
      MessageLoop.sendMessage(this.parent, msg);
    }
  }

  /**
   * Show or hide the widget according to a boolean value.
   *
   * @param hidden - `true` to hide the widget, or `false` to show it.
   *
   * #### Notes
   * This is a convenience method for `hide()` and `show()`.
   */
  setHidden(hidden: boolean): void {
    if (hidden) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Test whether the given widget flag is set.
   *
   * #### Notes
   * This will not typically be called directly by user code.
   */
  testFlag(flag: Widget.Flag): boolean {
    return (this._flags & flag) !== 0;
  }

  /**
   * Set the given widget flag.
   *
   * #### Notes
   * This will not typically be called directly by user code.
   */
  setFlag(flag: Widget.Flag): void {
    this._flags |= flag;
  }

  /**
   * Clear the given widget flag.
   *
   * #### Notes
   * This will not typically be called directly by user code.
   */
  clearFlag(flag: Widget.Flag): void {
    this._flags &= ~flag;
  }

  /**
   * Process a message sent to the widget.
   *
   * @param msg - The message sent to the widget.
   *
   * #### Notes
   * Subclasses may reimplement this method as needed.
   */
  processMessage(msg: Message): void {
    switch (msg.type) {
      case 'resize':
        this.notifyLayout(msg);
        this.onResize(msg as Widget.ResizeMessage);
        break;
      case 'update-request':
        this.notifyLayout(msg);
        this.onUpdateRequest(msg);
        break;
      case 'fit-request':
        this.notifyLayout(msg);
        this.onFitRequest(msg);
        break;
      case 'before-show':
        this.notifyLayout(msg);
        this.onBeforeShow(msg);
        break;
      case 'after-show':
        this.setFlag(Widget.Flag.IsVisible);
        this.notifyLayout(msg);
        this.onAfterShow(msg);
        break;
      case 'before-hide':
        this.notifyLayout(msg);
        this.onBeforeHide(msg);
        break;
      case 'after-hide':
        this.clearFlag(Widget.Flag.IsVisible);
        this.notifyLayout(msg);
        this.onAfterHide(msg);
        break;
      case 'before-attach':
        this.notifyLayout(msg);
        this.onBeforeAttach(msg);
        break;
      case 'after-attach':
        if (!this.isHidden && (!this.parent || this.parent.isVisible)) {
          this.setFlag(Widget.Flag.IsVisible);
        }
        this.setFlag(Widget.Flag.IsAttached);
        this.notifyLayout(msg);
        this.onAfterAttach(msg);
        break;
      case 'before-detach':
        this.notifyLayout(msg);
        this.onBeforeDetach(msg);
        break;
      case 'after-detach':
        this.clearFlag(Widget.Flag.IsVisible);
        this.clearFlag(Widget.Flag.IsAttached);
        this.notifyLayout(msg);
        this.onAfterDetach(msg);
        break;
      case 'activate-request':
        this.notifyLayout(msg);
        this.onActivateRequest(msg);
        break;
      case 'close-request':
        this.notifyLayout(msg);
        this.onCloseRequest(msg);
        break;
      case 'child-added':
        this.notifyLayout(msg);
        this.onChildAdded(msg as Widget.ChildMessage);
        break;
      case 'child-removed':
        this.notifyLayout(msg);
        this.onChildRemoved(msg as Widget.ChildMessage);
        break;
      default:
        this.notifyLayout(msg);
        break;
    }
  }

  /**
   * Invoke the message processing routine of the widget's layout.
   *
   * @param msg - The message to dispatch to the layout.
   *
   * #### Notes
   * This is a no-op if the widget does not have a layout.
   *
   * This will not typically be called directly by user code.
   */
  protected notifyLayout(msg: Message): void {
    if (this._layout) {
      this._layout.processParentMessage(msg);
    }
  }

  /**
   * A message handler invoked on a `'close-request'` message.
   *
   * #### Notes
   * The default implementation unparents or detaches the widget.
   */
  protected onCloseRequest(msg: Message): void {
    if (this.parent) {
      this.parent = null;
    } else if (this.isAttached) {
      Widget.detach(this);
    }
  }

  /**
   * A message handler invoked on a `'resize'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onResize(msg: Widget.ResizeMessage): void {}

  /**
   * A message handler invoked on an `'update-request'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onUpdateRequest(msg: Message): void {}

  /**
   * A message handler invoked on a `'fit-request'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onFitRequest(msg: Message): void {}

  /**
   * A message handler invoked on an `'activate-request'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onActivateRequest(msg: Message): void {}

  /**
   * A message handler invoked on a `'before-show'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onBeforeShow(msg: Message): void {}

  /**
   * A message handler invoked on an `'after-show'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onAfterShow(msg: Message): void {}

  /**
   * A message handler invoked on a `'before-hide'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onBeforeHide(msg: Message): void {}

  /**
   * A message handler invoked on an `'after-hide'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onAfterHide(msg: Message): void {}

  /**
   * A message handler invoked on a `'before-attach'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onBeforeAttach(msg: Message): void {}

  /**
   * A message handler invoked on an `'after-attach'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onAfterAttach(msg: Message): void {}

  /**
   * A message handler invoked on a `'before-detach'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onBeforeDetach(msg: Message): void {}

  /**
   * A message handler invoked on an `'after-detach'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onAfterDetach(msg: Message): void {}

  /**
   * A message handler invoked on a `'child-added'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onChildAdded(msg: Widget.ChildMessage): void {}

  /**
   * A message handler invoked on a `'child-removed'` message.
   *
   * #### Notes
   * The default implementation of this handler is a no-op.
   */
  protected onChildRemoved(msg: Widget.ChildMessage): void {}

  private _toggleHidden(hidden: boolean) {
    if (hidden) {
      switch (this._hiddenMode) {
        case Widget.HiddenMode.Display:
          this.addClass('lm-mod-hidden');
          break;
        case Widget.HiddenMode.Scale:
          this.node.style.transform = 'scale(0)';
          this.node.setAttribute('aria-hidden', 'true');
          break;
        case Widget.HiddenMode.ContentVisibility:
          this.node.style.contentVisibility = 'hidden';
          this.node.style.zIndex = '-1';
          break;
      }
    } else {
      switch (this._hiddenMode) {
        case Widget.HiddenMode.Display:
          this.removeClass('lm-mod-hidden');
          break;
        case Widget.HiddenMode.Scale:
          this.node.style.transform = '';
          this.node.removeAttribute('aria-hidden');
          break;
        case Widget.HiddenMode.ContentVisibility:
          this.node.style.contentVisibility = '';
          this.node.style.zIndex = '';
          break;
      }
    }
  }

  private _flags = 0;

  private _layout: Layout | null = null;

  private _parent: Widget | null = null;

  private _disposed = new Signal<this, void>(this);

  private _hiddenMode: Widget.HiddenMode = Widget.HiddenMode.Display;
}

/**
 * The namespace for the `Widget` class statics.
 */
export namespace Widget {
  /**
   * An options object for initializing a widget.
   */
  export interface IOptions {
    /**
     * The optional node to use for the widget.
     *
     * If a node is provided, the widget will assume full ownership
     * and control of the node, as if it had created the node itself.
     *
     * The default is a new `<div>`.
     */
    node?: HTMLElement;

    /**
     * The optional element tag, used for constructing the widget's node.
     *
     * If a pre-constructed node is provided via the `node` arg, this
     * value is ignored.
     */
    tag?: keyof HTMLElementTagNameMap;
  }

  /**
   * The method for hiding the widget.
   *
   * The default is Display.
   *
   * Using `Scale` will often increase performance as most browsers will not
   * trigger style computation for the `transform` action. This should be used
   * sparingly and tested, since increasing the number of composition layers
   * may slow things down.
   *
   * To ensure the transformation does not trigger style recomputation, you
   * may need to set the widget CSS style `will-change: transform`. This
   * should be used only when needed as it may overwhelm the browser with a
   * high number of layers. See
   * https://developer.mozilla.org/en-US/docs/Web/CSS/will-change
   */
  export enum HiddenMode {
    /**
     * Set a `lm-mod-hidden` CSS class to hide the widget using `display:none`
     * CSS from the standard Lumino CSS.
     */
    Display = 0,

    /**
     * Hide the widget by setting the `transform` to `'scale(0)'`.
     */
    Scale,

    /**
     *Hide the widget by setting the `content-visibility` to `'hidden'`.
     */
    ContentVisibility,
  }

  /**
   * An enum of widget bit flags.
   */
  export enum Flag {
    /**
     * The widget has been disposed.
     */
    IsDisposed = 0x1,

    /**
     * The widget is attached to the DOM.
     */
    IsAttached = 0x2,

    /**
     * The widget is hidden.
     */
    IsHidden = 0x4,

    /**
     * The widget is visible.
     */
    IsVisible = 0x8,

    /**
     * A layout cannot be set on the widget.
     */
    DisallowLayout = 0x10,
  }

  /**
   * A collection of stateless messages related to widgets.
   */
  export namespace Msg {
    /**
     * A singleton `'before-show'` message.
     *
     * #### Notes
     * This message is sent to a widget before it becomes visible.
     *
     * This message is **not** sent when the widget is being attached.
     */
    export const BeforeShow = new Message('before-show');

    /**
     * A singleton `'after-show'` message.
     *
     * #### Notes
     * This message is sent to a widget after it becomes visible.
     *
     * This message is **not** sent when the widget is being attached.
     */
    export const AfterShow = new Message('after-show');

    /**
     * A singleton `'before-hide'` message.
     *
     * #### Notes
     * This message is sent to a widget before it becomes not-visible.
     *
     * This message is **not** sent when the widget is being detached.
     */
    export const BeforeHide = new Message('before-hide');

    /**
     * A singleton `'after-hide'` message.
     *
     * #### Notes
     * This message is sent to a widget after it becomes not-visible.
     *
     * This message is **not** sent when the widget is being detached.
     */
    export const AfterHide = new Message('after-hide');

    /**
     * A singleton `'before-attach'` message.
     *
     * #### Notes
     * This message is sent to a widget before it is attached.
     */
    export const BeforeAttach = new Message('before-attach');

    /**
     * A singleton `'after-attach'` message.
     *
     * #### Notes
     * This message is sent to a widget after it is attached.
     */
    export const AfterAttach = new Message('after-attach');

    /**
     * A singleton `'before-detach'` message.
     *
     * #### Notes
     * This message is sent to a widget before it is detached.
     */
    export const BeforeDetach = new Message('before-detach');

    /**
     * A singleton `'after-detach'` message.
     *
     * #### Notes
     * This message is sent to a widget after it is detached.
     */
    export const AfterDetach = new Message('after-detach');

    /**
     * A singleton `'parent-changed'` message.
     *
     * #### Notes
     * This message is sent to a widget when its parent has changed.
     */
    export const ParentChanged = new Message('parent-changed');

    /**
     * A singleton conflatable `'update-request'` message.
     *
     * #### Notes
     * This message can be dispatched to supporting widgets in order to
     * update their content based on the current widget state. Not all
     * widgets will respond to messages of this type.
     *
     * For widgets with a layout, this message will inform the layout to
     * update the position and size of its child widgets.
     */
    export const UpdateRequest = new ConflatableMessage('update-request');

    /**
     * A singleton conflatable `'fit-request'` message.
     *
     * #### Notes
     * For widgets with a layout, this message will inform the layout to
     * recalculate its size constraints to fit the space requirements of
     * its child widgets, and to update their position and size. Not all
     * layouts will respond to messages of this type.
     */
    export const FitRequest = new ConflatableMessage('fit-request');

    /**
     * A singleton conflatable `'activate-request'` message.
     *
     * #### Notes
     * This message should be dispatched to a widget when it should
     * perform the actions necessary to activate the widget, which
     * may include focusing its node or descendant node.
     */
    export const ActivateRequest = new ConflatableMessage('activate-request');

    /**
     * A singleton conflatable `'close-request'` message.
     *
     * #### Notes
     * This message should be dispatched to a widget when it should close
     * and remove itself from the widget hierarchy.
     */
    export const CloseRequest = new ConflatableMessage('close-request');
  }

  /**
   * A message class for child related messages.
   */
  export class ChildMessage extends Message {
    /**
     * Construct a new child message.
     *
     * @param type - The message type.
     *
     * @param child - The child widget for the message.
     */
    constructor(type: string, child: Widget) {
      super(type);
      this.child = child;
    }

    /**
     * The child widget for the message.
     */
    readonly child: Widget;
  }

  /**
   * A message class for `'resize'` messages.
   */
  export class ResizeMessage extends Message {
    /**
     * Construct a new resize message.
     *
     * @param width - The **offset width** of the widget, or `-1` if
     *   the width is not known.
     *
     * @param height - The **offset height** of the widget, or `-1` if
     *   the height is not known.
     */
    constructor(width: number, height: number) {
      super('resize');
      this.width = width;
      this.height = height;
    }

    /**
     * The offset width of the widget.
     *
     * #### Notes
     * This will be `-1` if the width is unknown.
     */
    readonly width: number;

    /**
     * The offset height of the widget.
     *
     * #### Notes
     * This will be `-1` if the height is unknown.
     */
    readonly height: number;
  }

  /**
   * The namespace for the `ResizeMessage` class statics.
   */
  export namespace ResizeMessage {
    /**
     * A singleton `'resize'` message with an unknown size.
     */
    export const UnknownSize = new ResizeMessage(-1, -1);
  }

  /**
   * Attach a widget to a host DOM node.
   *
   * @param widget - The widget of interest.
   *
   * @param host - The DOM node to use as the widget's host.
   *
   * @param ref - The child of `host` to use as the reference element.
   *   If this is provided, the widget will be inserted before this
   *   node in the host. The default is `null`, which will cause the
   *   widget to be added as the last child of the host.
   *
   * #### Notes
   * This will throw an error if the widget is not a root widget, if
   * the widget is already attached, or if the host is not attached
   * to the DOM.
   */
  export function attach(
    widget: Widget,
    host: HTMLElement,
    ref: HTMLElement | null = null,
  ): void {
    if (widget.parent) {
      throw new Error('Cannot attach a child widget.');
    }
    if (widget.isAttached || widget.node.isConnected) {
      throw new Error('Widget is already attached.');
    }
    if (!host.isConnected) {
      throw new Error('Host is not attached.');
    }
    MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
    host.insertBefore(widget.node, ref);
    MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
  }

  /**
   * Detach the widget from its host DOM node.
   *
   * @param widget - The widget of interest.
   *
   * #### Notes
   * This will throw an error if the widget is not a root widget,
   * or if the widget is not attached to the DOM.
   */
  export function detach(widget: Widget): void {
    if (widget.parent) {
      throw new Error('Cannot detach a child widget.');
    }
    if (!widget.isAttached || !widget.node.isConnected) {
      throw new Error('Widget is not attached.');
    }
    MessageLoop.sendMessage(widget, Widget.Msg.BeforeDetach);
    widget.node.parentNode!.removeChild(widget.node);
    MessageLoop.sendMessage(widget, Widget.Msg.AfterDetach);
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * An attached property for the widget title object.
   */
  export const titleProperty = new AttachedProperty<Widget, Title<Widget>>({
    name: 'title',
    create: owner => new Title<Widget>({ owner }),
  });

  /**
   * Create a DOM node for the given widget options.
   */
  export function createNode(options: Widget.IOptions): HTMLElement {
    return options.node || document.createElement(options.tag || 'div');
  }
}
