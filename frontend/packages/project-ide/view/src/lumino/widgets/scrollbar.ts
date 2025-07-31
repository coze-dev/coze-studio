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
import { type Message } from '../messaging';
import { Drag } from '../dragdrop';
import { ElementExt } from '../domutils';
import { type IDisposable } from '../disposable';
import { Widget } from './widget';

/**
 * A widget which implements a canonical scroll bar.
 */
export class ScrollBar extends Widget {
  /**
   * Construct a new scroll bar.
   *
   * @param options - The options for initializing the scroll bar.
   */
  constructor(options: ScrollBar.IOptions = {}) {
    super({ node: Private.createNode() });
    this.addClass('lm-ScrollBar');
    this.setFlag(Widget.Flag.DisallowLayout);

    // Set the orientation.
    this._orientation = options.orientation || 'vertical';
    this.dataset.orientation = this._orientation;

    // Parse the rest of the options.
    if (options.maximum !== undefined) {
      this._maximum = Math.max(0, options.maximum);
    }
    if (options.page !== undefined) {
      this._page = Math.max(0, options.page);
    }
    if (options.value !== undefined) {
      this._value = Math.max(0, Math.min(options.value, this._maximum));
    }
  }

  /**
   * A signal emitted when the user moves the scroll thumb.
   *
   * #### Notes
   * The payload is the current value of the scroll bar.
   */
  get thumbMoved(): ISignal<this, number> {
    return this._thumbMoved;
  }

  /**
   * A signal emitted when the user clicks a step button.
   *
   * #### Notes
   * The payload is whether a decrease or increase is requested.
   */
  get stepRequested(): ISignal<this, 'decrement' | 'increment'> {
    return this._stepRequested;
  }

  /**
   * A signal emitted when the user clicks the scroll track.
   *
   * #### Notes
   * The payload is whether a decrease or increase is requested.
   */
  get pageRequested(): ISignal<this, 'decrement' | 'increment'> {
    return this._pageRequested;
  }

  /**
   * Get the orientation of the scroll bar.
   */
  get orientation(): ScrollBar.Orientation {
    return this._orientation;
  }

  /**
   * Set the orientation of the scroll bar.
   */
  set orientation(value: ScrollBar.Orientation) {
    // Do nothing if the orientation does not change.
    if (this._orientation === value) {
      return;
    }

    // Release the mouse before making changes.
    this._releaseMouse();

    // Update the internal orientation.
    this._orientation = value;
    this.dataset.orientation = value;

    // Schedule an update the scroll bar.
    this.update();
  }

  /**
   * Get the current value of the scroll bar.
   */
  get value(): number {
    return this._value;
  }

  /**
   * Set the current value of the scroll bar.
   *
   * #### Notes
   * The value will be clamped to the range `[0, maximum]`.
   */
  set value(value: number) {
    // Clamp the value to the allowable range.
    value = Math.max(0, Math.min(value, this._maximum));

    // Do nothing if the value does not change.
    if (this._value === value) {
      return;
    }

    // Update the internal value.
    this._value = value;

    // Schedule an update the scroll bar.
    this.update();
  }

  /**
   * Get the page size of the scroll bar.
   *
   * #### Notes
   * The page size is the amount of visible content in the scrolled
   * region, expressed in data units. It determines the size of the
   * scroll bar thumb.
   */
  get page(): number {
    return this._page;
  }

  /**
   * Set the page size of the scroll bar.
   *
   * #### Notes
   * The page size will be clamped to the range `[0, Infinity]`.
   */
  set page(value: number) {
    // Clamp the page size to the allowable range.
    value = Math.max(0, value);

    // Do nothing if the value does not change.
    if (this._page === value) {
      return;
    }

    // Update the internal page size.
    this._page = value;

    // Schedule an update the scroll bar.
    this.update();
  }

  /**
   * Get the maximum value of the scroll bar.
   */
  get maximum(): number {
    return this._maximum;
  }

  /**
   * Set the maximum value of the scroll bar.
   *
   * #### Notes
   * The max size will be clamped to the range `[0, Infinity]`.
   */
  set maximum(value: number) {
    // Clamp the value to the allowable range.
    value = Math.max(0, value);

    // Do nothing if the value does not change.
    if (this._maximum === value) {
      return;
    }

    // Update the internal values.
    this._maximum = value;

    // Clamp the current value to the new range.
    this._value = Math.min(this._value, value);

    // Schedule an update the scroll bar.
    this.update();
  }

  /**
   * The scroll bar decrement button node.
   *
   * #### Notes
   * Modifying this node directly can lead to undefined behavior.
   */
  get decrementNode(): HTMLDivElement {
    return this.node.getElementsByClassName(
      'lm-ScrollBar-button',
    )[0] as HTMLDivElement;
  }

  /**
   * The scroll bar increment button node.
   *
   * #### Notes
   * Modifying this node directly can lead to undefined behavior.
   */
  get incrementNode(): HTMLDivElement {
    return this.node.getElementsByClassName(
      'lm-ScrollBar-button',
    )[1] as HTMLDivElement;
  }

  /**
   * The scroll bar track node.
   *
   * #### Notes
   * Modifying this node directly can lead to undefined behavior.
   */
  get trackNode(): HTMLDivElement {
    return this.node.getElementsByClassName(
      'lm-ScrollBar-track',
    )[0] as HTMLDivElement;
  }

  /**
   * The scroll bar thumb node.
   *
   * #### Notes
   * Modifying this node directly can lead to undefined behavior.
   */
  get thumbNode(): HTMLDivElement {
    return this.node.getElementsByClassName(
      'lm-ScrollBar-thumb',
    )[0] as HTMLDivElement;
  }

  /**
   * Handle the DOM events for the scroll bar.
   *
   * @param event - The DOM event sent to the scroll bar.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the scroll bar's DOM node.
   *
   * This should not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'mousedown':
        this._evtMouseDown(event as MouseEvent);
        break;
      case 'mousemove':
        this._evtMouseMove(event as MouseEvent);
        break;
      case 'mouseup':
        this._evtMouseUp(event as MouseEvent);
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
   * A method invoked on a 'before-attach' message.
   */
  protected onBeforeAttach(msg: Message): void {
    this.node.addEventListener('mousedown', this);
    this.update();
  }

  /**
   * A method invoked on an 'after-detach' message.
   */
  protected onAfterDetach(msg: Message): void {
    this.node.removeEventListener('mousedown', this);
    this._releaseMouse();
  }

  /**
   * A method invoked on an 'update-request' message.
   */
  protected onUpdateRequest(msg: Message): void {
    // Convert the value and page into percentages.
    let value = (this._value * 100) / this._maximum;
    let page = (this._page * 100) / (this._page + this._maximum);

    // Clamp the value and page to the relevant range.
    value = Math.max(0, Math.min(value, 100));
    page = Math.max(0, Math.min(page, 100));

    // Fetch the thumb style.
    const thumbStyle = this.thumbNode.style;

    // Update the thumb style for the current orientation.
    if (this._orientation === 'horizontal') {
      thumbStyle.top = '';
      thumbStyle.height = '';
      thumbStyle.left = `${value}%`;
      thumbStyle.width = `${page}%`;
      thumbStyle.transform = `translate(${-value}%, 0%)`;
    } else {
      thumbStyle.left = '';
      thumbStyle.width = '';
      thumbStyle.top = `${value}%`;
      thumbStyle.height = `${page}%`;
      thumbStyle.transform = `translate(0%, ${-value}%)`;
    }
  }

  /**
   * Handle the `'keydown'` event for the scroll bar.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    // Stop all input events during drag.
    event.preventDefault();
    event.stopPropagation();

    // Ignore anything except the `Escape` key.
    if (event.keyCode !== 27) {
      return;
    }

    // Fetch the previous scroll value.
    const value = this._pressData ? this._pressData.value : -1;

    // Release the mouse.
    this._releaseMouse();

    // Restore the old scroll value if possible.
    if (value !== -1) {
      this._moveThumb(value);
    }
  }

  /**
   * Handle the `'mousedown'` event for the scroll bar.
   */
  private _evtMouseDown(event: MouseEvent): void {
    // Do nothing if it's not a left mouse press.
    if (event.button !== 0) {
      return;
    }

    // Send an activate request to the scroll bar. This can be
    // used by message hooks to activate something relevant.
    this.activate();

    // Do nothing if the mouse is already captured.
    if (this._pressData) {
      return;
    }

    // Find the pressed scroll bar part.
    const part = Private.findPart(this, event.target as HTMLElement);

    // Do nothing if the part is not of interest.
    if (!part) {
      return;
    }

    // Stop the event propagation.
    event.preventDefault();
    event.stopPropagation();

    // Override the mouse cursor.
    const override = Drag.overrideCursor('default');

    // Set up the press data.
    this._pressData = {
      part,
      override,
      delta: -1,
      value: -1,
      mouseX: event.clientX,
      mouseY: event.clientY,
    };

    // Add the extra event listeners.
    document.addEventListener('mousemove', this, true);
    document.addEventListener('mouseup', this, true);
    document.addEventListener('keydown', this, true);
    document.addEventListener('contextmenu', this, true);

    // Handle a thumb press.
    if (part === 'thumb') {
      // Fetch the thumb node.
      const { thumbNode } = this;

      // Fetch the client rect for the thumb.
      const thumbRect = thumbNode.getBoundingClientRect();

      // Update the press data delta for the current orientation.
      if (this._orientation === 'horizontal') {
        this._pressData.delta = event.clientX - thumbRect.left;
      } else {
        this._pressData.delta = event.clientY - thumbRect.top;
      }

      // Add the active class to the thumb node.
      thumbNode.classList.add('lm-mod-active');

      // Store the current value in the press data.
      this._pressData.value = this._value;

      // Finished.
      return;
    }

    // Handle a track press.
    if (part === 'track') {
      // Fetch the client rect for the thumb.
      const thumbRect = this.thumbNode.getBoundingClientRect();

      // Determine the direction for the page request.
      let dir: 'decrement' | 'increment';
      if (this._orientation === 'horizontal') {
        dir = event.clientX < thumbRect.left ? 'decrement' : 'increment';
      } else {
        dir = event.clientY < thumbRect.top ? 'decrement' : 'increment';
      }

      // Start the repeat timer.
      this._repeatTimer = window.setTimeout(this._onRepeat, 350);

      // Emit the page requested signal.
      this._pageRequested.emit(dir);

      // Finished.
      return;
    }

    // Handle a decrement button press.
    if (part === 'decrement') {
      // Add the active class to the decrement node.
      this.decrementNode.classList.add('lm-mod-active');

      // Start the repeat timer.
      this._repeatTimer = window.setTimeout(this._onRepeat, 350);

      // Emit the step requested signal.
      this._stepRequested.emit('decrement');

      // Finished.
      return;
    }

    // Handle an increment button press.
    if (part === 'increment') {
      // Add the active class to the increment node.
      this.incrementNode.classList.add('lm-mod-active');

      // Start the repeat timer.
      this._repeatTimer = window.setTimeout(this._onRepeat, 350);

      // Emit the step requested signal.
      this._stepRequested.emit('increment');

      // Finished.
      return;
    }
  }

  /**
   * Handle the `'mousemove'` event for the scroll bar.
   */
  private _evtMouseMove(event: MouseEvent): void {
    // Do nothing if no drag is in progress.
    if (!this._pressData) {
      return;
    }

    // Stop the event propagation.
    event.preventDefault();
    event.stopPropagation();

    // Update the mouse position.
    this._pressData.mouseX = event.clientX;
    this._pressData.mouseY = event.clientY;

    // Bail if the thumb is not being dragged.
    if (this._pressData.part !== 'thumb') {
      return;
    }

    // Get the client rect for the thumb and track.
    const thumbRect = this.thumbNode.getBoundingClientRect();
    const trackRect = this.trackNode.getBoundingClientRect();

    // Fetch the scroll geometry based on the orientation.
    let trackPos: number;
    let trackSpan: number;
    if (this._orientation === 'horizontal') {
      trackPos = event.clientX - trackRect.left - this._pressData.delta;
      trackSpan = trackRect.width - thumbRect.width;
    } else {
      trackPos = event.clientY - trackRect.top - this._pressData.delta;
      trackSpan = trackRect.height - thumbRect.height;
    }

    // Compute the desired value from the scroll geometry.
    const value = trackSpan === 0 ? 0 : (trackPos * this._maximum) / trackSpan;

    // Move the thumb to the computed value.
    this._moveThumb(value);
  }

  /**
   * Handle the `'mouseup'` event for the scroll bar.
   */
  private _evtMouseUp(event: MouseEvent): void {
    // Do nothing if it's not a left mouse release.
    if (event.button !== 0) {
      return;
    }

    // Stop the event propagation.
    event.preventDefault();
    event.stopPropagation();

    // Release the mouse.
    this._releaseMouse();
  }

  /**
   * Release the mouse and restore the node states.
   */
  private _releaseMouse(): void {
    // Bail if there is no press data.
    if (!this._pressData) {
      return;
    }

    // Clear the repeat timer.
    clearTimeout(this._repeatTimer);
    this._repeatTimer = -1;

    // Clear the press data.
    this._pressData.override.dispose();
    this._pressData = null;

    // Remove the extra event listeners.
    document.removeEventListener('mousemove', this, true);
    document.removeEventListener('mouseup', this, true);
    document.removeEventListener('keydown', this, true);
    document.removeEventListener('contextmenu', this, true);

    // Remove the active classes from the nodes.
    this.thumbNode.classList.remove('lm-mod-active');
    this.decrementNode.classList.remove('lm-mod-active');
    this.incrementNode.classList.remove('lm-mod-active');
  }

  /**
   * Move the thumb to the specified position.
   */
  private _moveThumb(value: number): void {
    // Clamp the value to the allowed range.
    value = Math.max(0, Math.min(value, this._maximum));

    // Bail if the value does not change.
    if (this._value === value) {
      return;
    }

    // Update the internal value.
    this._value = value;

    // Schedule an update of the scroll bar.
    this.update();

    // Emit the thumb moved signal.
    this._thumbMoved.emit(value);
  }

  /**
   * A timeout callback for repeating the mouse press.
   */
  private _onRepeat = () => {
    // Clear the repeat timer id.
    this._repeatTimer = -1;

    // Bail if the mouse has been released.
    if (!this._pressData) {
      return;
    }

    // Look up the part that was pressed.
    const { part } = this._pressData;

    // Bail if the thumb was pressed.
    if (part === 'thumb') {
      return;
    }

    // Schedule the timer for another repeat.
    this._repeatTimer = window.setTimeout(this._onRepeat, 20);

    // Get the current mouse position.
    const { mouseX } = this._pressData;
    const { mouseY } = this._pressData;

    // Handle a decrement button repeat.
    if (part === 'decrement') {
      // Bail if the mouse is not over the button.
      if (!ElementExt.hitTest(this.decrementNode, mouseX, mouseY)) {
        return;
      }

      // Emit the step requested signal.
      this._stepRequested.emit('decrement');

      // Finished.
      return;
    }

    // Handle an increment button repeat.
    if (part === 'increment') {
      // Bail if the mouse is not over the button.
      if (!ElementExt.hitTest(this.incrementNode, mouseX, mouseY)) {
        return;
      }

      // Emit the step requested signal.
      this._stepRequested.emit('increment');

      // Finished.
      return;
    }

    // Handle a track repeat.
    if (part === 'track') {
      // Bail if the mouse is not over the track.
      if (!ElementExt.hitTest(this.trackNode, mouseX, mouseY)) {
        return;
      }

      // Fetch the thumb node.
      const { thumbNode } = this;

      // Bail if the mouse is over the thumb.
      if (ElementExt.hitTest(thumbNode, mouseX, mouseY)) {
        return;
      }

      // Fetch the client rect for the thumb.
      const thumbRect = thumbNode.getBoundingClientRect();

      // Determine the direction for the page request.
      let dir: 'decrement' | 'increment';
      if (this._orientation === 'horizontal') {
        dir = mouseX < thumbRect.left ? 'decrement' : 'increment';
      } else {
        dir = mouseY < thumbRect.top ? 'decrement' : 'increment';
      }

      // Emit the page requested signal.
      this._pageRequested.emit(dir);

      // Finished.
      return;
    }
  };

  private _value = 0;

  private _page = 10;

  private _maximum = 100;

  private _repeatTimer = -1;

  private _orientation: ScrollBar.Orientation;

  private _pressData: Private.IPressData | null = null;

  private _thumbMoved = new Signal<this, number>(this);

  private _stepRequested = new Signal<this, 'decrement' | 'increment'>(this);

  private _pageRequested = new Signal<this, 'decrement' | 'increment'>(this);
}

/**
 * The namespace for the `ScrollBar` class statics.
 */
export namespace ScrollBar {
  /**
   * A type alias for a scroll bar orientation.
   */
  export type Orientation = 'horizontal' | 'vertical';

  /**
   * An options object for creating a scroll bar.
   */
  export interface IOptions {
    /**
     * The orientation of the scroll bar.
     *
     * The default is `'vertical'`.
     */
    orientation?: Orientation;

    /**
     * The value for the scroll bar.
     *
     * The default is `0`.
     */
    value?: number;

    /**
     * The page size for the scroll bar.
     *
     * The default is `10`.
     */
    page?: number;

    /**
     * The maximum value for the scroll bar.
     *
     * The default is `100`.
     */
    maximum?: number;
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * A type alias for the parts of a scroll bar.
   */
  export type ScrollBarPart = 'thumb' | 'track' | 'decrement' | 'increment';

  /**
   * An object which holds mouse press data.
   */
  export interface IPressData {
    /**
     * The scroll bar part which was pressed.
     */
    part: ScrollBarPart;

    /**
     * The offset of the press in thumb coordinates, or -1.
     */
    delta: number;

    /**
     * The scroll value at the time the thumb was pressed, or -1.
     */
    value: number;

    /**
     * The disposable which will clear the override cursor.
     */
    override: IDisposable;

    /**
     * The current X position of the mouse.
     */
    mouseX: number;

    /**
     * The current Y position of the mouse.
     */
    mouseY: number;
  }

  /**
   * Create the DOM node for a scroll bar.
   */
  export function createNode(): HTMLElement {
    const node = document.createElement('div');
    const decrement = document.createElement('div');
    const increment = document.createElement('div');
    const track = document.createElement('div');
    const thumb = document.createElement('div');
    decrement.className = 'lm-ScrollBar-button';
    increment.className = 'lm-ScrollBar-button';
    decrement.dataset.action = 'decrement';
    increment.dataset.action = 'increment';
    track.className = 'lm-ScrollBar-track';
    thumb.className = 'lm-ScrollBar-thumb';
    track.appendChild(thumb);
    node.appendChild(decrement);
    node.appendChild(track);
    node.appendChild(increment);
    return node;
  }

  /**
   * Find the scroll bar part which contains the given target.
   */
  export function findPart(
    scrollBar: ScrollBar,
    target: HTMLElement,
  ): ScrollBarPart | null {
    // Test the thumb.
    if (scrollBar.thumbNode.contains(target)) {
      return 'thumb';
    }

    // Test the track.
    if (scrollBar.trackNode.contains(target)) {
      return 'track';
    }

    // Test the decrement button.
    if (scrollBar.decrementNode.contains(target)) {
      return 'decrement';
    }

    // Test the increment button.
    if (scrollBar.incrementNode.contains(target)) {
      return 'increment';
    }

    // Indicate no match.
    return null;
  }
}
