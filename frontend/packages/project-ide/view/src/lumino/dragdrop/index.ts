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

import { DisposableDelegate, type IDisposable } from '../disposable';
import { type MimeData } from '../coreutils';

/**
 * @deprecated
 *
 * #### Notes
 * This interface is deprecated. Use Drag.Event instead.
 */
export interface IDragEvent extends Drag.Event {}

/**
 * An object which manages a drag-drop operation.
 *
 * A drag object dispatches four different events to drop targets:
 *
 * - `'lm-dragenter'` - Dispatched when the mouse enters the target
 *   element. This event must be canceled in order to receive any
 *   of the other events.
 *
 * - `'lm-dragover'` - Dispatched when the mouse moves over the drop
 *   target. It must cancel the event and set the `dropAction` to one
 *   of the supported actions in order to receive drop events.
 *
 * - `'lm-dragleave'` - Dispatched when the mouse leaves the target
 *   element. This includes moving the mouse into child elements.
 *
 * - `'lm-drop'`- Dispatched when the mouse is released over the target
 *   element when the target indicates an appropriate drop action. If
 *   the event is canceled, the indicated drop action is returned to
 *   the initiator through the resolved promise.
 *
 * A drag operation can be terminated at any time by pressing `Escape`
 * or by disposing the drag object.
 *
 * A drag object has the ability to automatically scroll a scrollable
 * element when the mouse is hovered near one of its edges. To enable
 * this, add the `data-lm-dragscroll` attribute to any element which
 * the drag object should consider for scrolling.
 *
 * #### Notes
 * This class is designed to be used when dragging and dropping custom
 * data *within* a single application. It is *not* a replacement for
 * the native drag-drop API. Instead, it provides an API which allows
 * drag operations to be initiated programmatically and enables the
 * transfer of arbitrary non-string objects; features which are not
 * possible with the native drag-drop API.
 */
export class Drag implements IDisposable {
  /**
   * Construct a new drag object.
   *
   * @param options - The options for initializing the drag.
   */
  constructor(options: Drag.IOptions) {
    this.document = options.document || document;
    this.mimeData = options.mimeData;
    this.dragImage = options.dragImage || null;
    this.proposedAction = options.proposedAction || 'copy';
    this.supportedActions = options.supportedActions || 'all';
    this.source = options.source || null;
    Private.backdropTransform = options.backdropTransform;
  }

  /**
   * Dispose of the resources held by the drag object.
   *
   * #### Notes
   * This will cancel the drag operation if it is active.
   */
  dispose(): void {
    // Do nothing if the drag object is already disposed.
    if (this._disposed) {
      return;
    }
    this._disposed = true;

    // If there is a current target, dispatch a drag leave event.
    if (this._currentTarget) {
      const event = new PointerEvent('pointerup', {
        bubbles: true,
        cancelable: true,
        clientX: -1,
        clientY: -1,
      });
      Private.dispatchDragLeave(this, this._currentTarget, null, event);
    }

    // Finalize the drag object with `'none'`.
    this._finalize('none');
  }

  /**
   * The mime data for the drag object.
   */
  readonly mimeData: MimeData;

  /**
   * The target document for dragging events.
   */
  readonly document: Document | ShadowRoot;

  /**
   * The drag image element for the drag object.
   */
  readonly dragImage: HTMLElement | null;

  /**
   * The proposed drop action for the drag object.
   */
  readonly proposedAction: Drag.DropAction;

  /**
   * The supported drop actions for the drag object.
   */
  readonly supportedActions: Drag.SupportedActions;

  /**
   * Get the drag source for the drag object.
   */
  readonly source: any;

  /**
   * Test whether the drag object is disposed.
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Start the drag operation at the specified client position.
   *
   * @param clientX - The client X position for the drag start.
   *
   * @param clientY - The client Y position for the drag start.
   *
   * @returns A promise which resolves to the result of the drag.
   *
   * #### Notes
   * If the drag has already been started, the promise created by the
   * first call to `start` is returned.
   *
   * If the drag operation has ended, or if the drag object has been
   * disposed, the returned promise will resolve to `'none'`.
   *
   * The drag object will be automatically disposed when drag operation
   * completes. This means `Drag` objects are for single-use only.
   *
   * This method assumes the left mouse button is already held down.
   */
  start(clientX: number, clientY: number): Promise<Drag.DropAction> {
    // If the drag object is already disposed, resolve to `none`.
    if (this._disposed) {
      return Promise.resolve('none');
    }

    // If the drag has already been started, return the promise.
    if (this._promise) {
      return this._promise;
    }

    // Install the document listeners for the drag object.
    this._addListeners();

    // Attach the drag image at the specified client position.
    this._attachDragImage(clientX, clientY);

    // Create the promise which will be resolved on completion.
    this._promise = new Promise<Drag.DropAction>(resolve => {
      this._resolve = resolve;
    });

    // Trigger a fake move event to kick off the drag operation.
    const event = new PointerEvent('pointermove', {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
    });
    document.dispatchEvent(event);

    // Return the pending promise for the drag operation.
    return this._promise;
  }

  /**
   * Handle the DOM events for the drag operation.
   *
   * @param event - The DOM event sent to the drag object.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the document. It should not be
   * called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
      case 'pointermove':
        this._evtPointerMove(event as PointerEvent);
        break;
      case 'pointerup':
        this._evtPointerUp(event as PointerEvent);
        break;
      case 'keydown':
        this._evtKeyDown(event as KeyboardEvent);
        break;
      default:
        // Stop all other events during drag-drop.
        event.preventDefault();
        event.stopPropagation();
        break;
    }
  }

  /**
   * Move the drag image element to the specified location.
   *
   * This is a no-op if there is no drag image element.
   */
  protected moveDragImage(clientX: number, clientY: number): void {
    if (!this.dragImage) {
      return;
    }
    const { style } = this.dragImage;
    style.transform = `translate(${clientX}px, ${clientY}px)`;
  }

  /**
   * Handle the `'pointermove'` event for the drag object.
   */
  private _evtPointerMove(event: PointerEvent): void {
    // Stop all input events during drag-drop.
    event.preventDefault();
    event.stopPropagation();

    // Update the current target node and dispatch enter/leave events.
    this._updateCurrentTarget(event);

    // Update the drag scroll element.
    this._updateDragScroll(event);

    // Move the drag image to the specified client position. This is
    // performed *after* dispatching to prevent unnecessary reflows.
    this.moveDragImage(event.clientX, event.clientY);
  }

  /**
   * Handle the `'pointerup'` event for the drag object.
   */
  private _evtPointerUp(event: PointerEvent): void {
    // Stop all input events during drag-drop.
    event.preventDefault();
    event.stopPropagation();

    // Do nothing if the left button is not released.
    if (event.button !== 0) {
      return;
    }

    // Update the current target node and dispatch enter/leave events.
    // This prevents a subtle issue where the DOM mutates under the
    // cursor after the last move event but before the drop event.
    this._updateCurrentTarget(event);

    // If there is no current target, finalize with `'none'`.
    if (!this._currentTarget) {
      this._finalize('none');
      return;
    }

    // If the last drop action was `'none'`, dispatch a leave event
    // to the current target and finalize the drag with `'none'`.
    if (this._dropAction === 'none') {
      Private.dispatchDragLeave(this, this._currentTarget, null, event);
      this._finalize('none');
      return;
    }

    // Dispatch the drop event at the current target and finalize
    // with the resulting drop action.
    const action = Private.dispatchDrop(this, this._currentTarget, event);
    this._finalize(action);
  }

  /**
   * Handle the `'keydown'` event for the drag object.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    // Stop all input events during drag-drop.
    event.preventDefault();
    event.stopPropagation();

    // Cancel the drag if `Escape` is pressed.
    if (event.keyCode === 27) {
      this.dispose();
    }
  }

  /**
   * Add the document event listeners for the drag object.
   */
  private _addListeners(): void {
    document.addEventListener('pointerdown', this, true);
    document.addEventListener('pointermove', this, true);
    document.addEventListener('pointerup', this, true);
    document.addEventListener('pointerenter', this, true);
    document.addEventListener('pointerleave', this, true);
    document.addEventListener('pointerover', this, true);
    document.addEventListener('pointerout', this, true);
    document.addEventListener('keydown', this, true);
    document.addEventListener('keyup', this, true);
    document.addEventListener('keypress', this, true);
    document.addEventListener('contextmenu', this, true);
  }

  /**
   * Remove the document event listeners for the drag object.
   */
  private _removeListeners(): void {
    document.removeEventListener('pointerdown', this, true);
    document.removeEventListener('pointermove', this, true);
    document.removeEventListener('pointerup', this, true);
    document.removeEventListener('pointerenter', this, true);
    document.removeEventListener('pointerleave', this, true);
    document.removeEventListener('pointerover', this, true);
    document.removeEventListener('pointerout', this, true);
    document.removeEventListener('keydown', this, true);
    document.removeEventListener('keyup', this, true);
    document.removeEventListener('keypress', this, true);
    document.removeEventListener('contextmenu', this, true);
  }

  /**
   * Update the drag scroll element under the mouse.
   */
  private _updateDragScroll(event: PointerEvent): void {
    // Find the scroll target under the mouse.
    const target = Private.findScrollTarget(event);

    // Bail if there is nothing to scroll.
    if (!this._scrollTarget && !target) {
      return;
    }

    // Start the scroll loop if needed.
    if (!this._scrollTarget) {
      setTimeout(this._onScrollFrame, 500);
    }

    // Update the scroll target.
    this._scrollTarget = target;
  }

  /**
   * Update the current target node using the given mouse event.
   */
  private _updateCurrentTarget(event: PointerEvent): void {
    // Fetch common local state.
    const prevTarget = this._currentTarget;
    let currTarget = this._currentTarget;
    const prevElem = this._currentElement;

    // Find the current indicated element at the given position.
    const currElem = Private.findElementBehindBackdrop(event, this.document);

    // Update the current element reference.
    this._currentElement = currElem;

    // If the indicated element changes from the previous iteration,
    // and is different from the current target, dispatch the exit
    // event to the target.
    if (currElem !== prevElem && currElem !== currTarget) {
      Private.dispatchDragExit(this, currTarget, currElem, event);
    }

    // If the indicated element changes from the previous iteration,
    // and is different from the current target, dispatch the enter
    // event and compute the new target element.
    if (currElem !== prevElem && currElem !== currTarget) {
      currTarget = Private.dispatchDragEnter(this, currElem, currTarget, event);
    }

    // If the current target element has changed, update the current
    // target reference and dispatch the leave event to the old target.
    if (currTarget !== prevTarget) {
      this._currentTarget = currTarget;
      Private.dispatchDragLeave(this, prevTarget, currTarget, event);
    }

    // Dispatch the drag over event and update the drop action.
    const action = Private.dispatchDragOver(this, currTarget, event);
    this._setDropAction(action);
  }

  /**
   * Attach the drag image element at the specified location.
   *
   * This is a no-op if there is no drag image element.
   */
  private _attachDragImage(clientX: number, clientY: number): void {
    if (!this.dragImage) {
      return;
    }
    this.dragImage.classList.add('lm-mod-drag-image');
    const { style } = this.dragImage;
    style.pointerEvents = 'none';
    style.position = 'fixed';
    style.transform = `translate(${clientX}px, ${clientY}px)`;
    const body =
      this.document instanceof Document
        ? this.document.body
        : (this.document.firstElementChild as HTMLElement);
    body.appendChild(this.dragImage);
  }

  /**
   * Detach the drag image element from the DOM.
   *
   * This is a no-op if there is no drag image element.
   */
  private _detachDragImage(): void {
    if (!this.dragImage) {
      return;
    }
    const parent = this.dragImage.parentNode;
    if (!parent) {
      return;
    }
    parent.removeChild(this.dragImage);
  }

  /**
   * Set the internal drop action state and update the drag cursor.
   */
  private _setDropAction(action: Drag.DropAction): void {
    action = Private.validateAction(action, this.supportedActions);
    if (this._override && this._dropAction === action) {
      return;
    }
    switch (action) {
      case 'none':
        this._dropAction = action;
        this._override = Drag.overrideCursor('no-drop', this.document);
        break;
      case 'copy':
        this._dropAction = action;
        this._override = Drag.overrideCursor('copy', this.document);
        break;
      case 'link':
        this._dropAction = action;
        this._override = Drag.overrideCursor('alias', this.document);
        break;
      case 'move':
        this._dropAction = action;
        this._override = Drag.overrideCursor('move', this.document);
        break;
    }
  }

  /**
   * Finalize the drag operation and resolve the drag promise.
   */
  private _finalize(action: Drag.DropAction): void {
    // Store the resolve function as a temp variable.
    const resolve = this._resolve;

    // Remove the document event listeners.
    this._removeListeners();

    // Detach the drag image.
    this._detachDragImage();

    // Dispose of the cursor override.
    if (this._override) {
      this._override.dispose();
      this._override = null;
    }

    // Clear the mime data.
    this.mimeData.clear();

    // Clear the rest of the internal drag state.
    this._disposed = true;
    this._dropAction = 'none';
    this._currentTarget = null;
    this._currentElement = null;
    this._scrollTarget = null;
    this._promise = null;
    this._resolve = null;

    // Finally, resolve the promise to the given drop action.
    if (resolve) {
      resolve(action);
    }
  }

  /**
   * The scroll loop handler function.
   */
  private _onScrollFrame = () => {
    // Bail early if there is no scroll target.
    if (!this._scrollTarget) {
      return;
    }

    // Unpack the scroll target.
    const { element, edge, distance } = this._scrollTarget;

    // Calculate the scroll delta using nonlinear acceleration.
    const d = Private.SCROLL_EDGE_SIZE - distance;
    const f = Math.pow(d / Private.SCROLL_EDGE_SIZE, 2);
    const s = Math.max(1, Math.round(f * Private.SCROLL_EDGE_SIZE));

    // Scroll the element in the specified direction.
    switch (edge) {
      case 'top':
        element.scrollTop -= s;
        break;
      case 'left':
        element.scrollLeft -= s;
        break;
      case 'right':
        element.scrollLeft += s;
        break;
      case 'bottom':
        element.scrollTop += s;
        break;
    }

    // Request the next cycle of the scroll loop.
    requestAnimationFrame(this._onScrollFrame);
  };

  private _disposed = false;

  private _dropAction: Drag.DropAction = 'none';

  private _override: IDisposable | null = null;

  private _currentTarget: Element | null = null;

  private _currentElement: Element | null = null;

  private _promise: Promise<Drag.DropAction> | null = null;

  private _scrollTarget: Private.IScrollTarget | null = null;

  private _resolve: ((value: Drag.DropAction) => void) | null = null;
}

/**
 * The namespace for the `Drag` class statics.
 */
export namespace Drag {
  /**
   * A type alias which defines the possible independent drop actions.
   */
  export type DropAction = 'none' | 'copy' | 'link' | 'move';

  /**
   * A type alias which defines the possible supported drop actions.
   */
  export type SupportedActions =
    | DropAction
    | 'copy-link'
    | 'copy-move'
    | 'link-move'
    | 'all';

  export interface BackDropTransform {
    clientX?: (eventX: number) => number;
    clientY?: (eventY: number) => number;
  }

  /**
   * An options object for initializing a `Drag` object.
   */
  export interface IOptions {
    /**
     * Due to the lm-cursor-backdrop element, it is used to prevent the hover event from being triggered during dragging and dropping the split screen.
     * Therefore, an additional configuration is introduced to configure the boundary position of this element
     */
    backdropTransform?: BackDropTransform;

    /**
     * The root element for dragging DOM artifacts (defaults to document).
     */
    document?: Document | ShadowRoot;

    /**
     * The populated mime data for the drag operation.
     */
    mimeData: MimeData;

    /**
     * An optional drag image which follows the mouse cursor.
     *
     * #### Notes
     * The drag image can be any DOM element. It is not limited to
     * image or canvas elements as with the native drag-drop APIs.
     *
     * If provided, this will be positioned at the mouse cursor on each
     * mouse move event. A CSS transform can be used to offset the node
     * from its specified position.
     *
     * The drag image will automatically have the `lm-mod-drag-image`
     * class name added.
     *
     * The default value is `null`.
     */
    dragImage?: HTMLElement;

    /**
     * The optional proposed drop action for the drag operation.
     *
     * #### Notes
     * This can be provided as a hint to the drop targets as to which
     * drop action is preferred.
     *
     * The default value is `'copy'`.
     */
    proposedAction?: DropAction;

    /**
     * The drop actions supported by the drag initiator.
     *
     * #### Notes
     * A drop target must indicate that it intends to perform one of the
     * supported actions in order to receive a drop event. However, it is
     * not required to *actually* perform that action when handling the
     * drop event. Therefore, the initiator must be prepared to handle
     * any drop action performed by a drop target.
     *
     * The default value is `'all'`.
     */
    supportedActions?: SupportedActions;

    /**
     * An optional object which indicates the source of the drag.
     *
     * #### Notes
     * For advanced applications, the drag initiator may wish to expose
     * a source object to the drop targets. That object can be specified
     * here and will be carried along with the drag events.
     *
     * The default value is `null`.
     */
    source?: any;
  }

  /**
   * A custom event used for drag-drop operations.
   *
   * #### Notes
   * In order to receive `'lm-dragover'`, `'lm-dragleave'`, or `'lm-drop'`
   * events, a drop target must cancel the `'lm-dragenter'` event by
   * calling the event's `preventDefault()` method.
   */
  export class Event extends DragEvent {
    constructor(event: PointerEvent, options: Event.IOptions) {
      super(options.type, {
        bubbles: true,
        cancelable: true,
        altKey: event.altKey,
        button: event.button,
        clientX: event.clientX,
        clientY: event.clientY,
        ctrlKey: event.ctrlKey,
        detail: 0,
        metaKey: event.metaKey,
        relatedTarget: options.related,
        screenX: event.screenX,
        screenY: event.screenY,
        shiftKey: event.shiftKey,
        view: window,
      });

      const { drag } = options;
      this.dropAction = 'none';
      this.mimeData = drag.mimeData;
      this.proposedAction = drag.proposedAction;
      this.supportedActions = drag.supportedActions;
      this.source = drag.source;
    }

    /**
     * The drop action supported or taken by the drop target.
     *
     * #### Notes
     * At the start of each event, this value will be `'none'`. During a
     * `'lm-dragover'` event, the drop target must set this value to one
     * of the supported actions, or the drop event will not occur.
     *
     * When handling the drop event, the drop target should set this
     * to the action which was *actually* taken. This value will be
     * reported back to the drag initiator.
     */
    dropAction: DropAction;

    /**
     * The drop action proposed by the drag initiator.
     *
     * #### Notes
     * This is the action which is *preferred* by the drag initiator. The
     * drop target is not required to perform this action, but should if
     * it all possible.
     */
    readonly proposedAction: DropAction;

    /**
     * The drop actions supported by the drag initiator.
     *
     * #### Notes
     * If the `dropAction` is not set to one of the supported actions
     * during the `'lm-dragover'` event, the drop event will not occur.
     */
    readonly supportedActions: SupportedActions;

    /**
     * The mime data associated with the event.
     *
     * #### Notes
     * This is mime data provided by the drag initiator. Drop targets
     * should use this data to determine if they can handle the drop.
     */
    readonly mimeData: MimeData;

    /**
     * The source object of the drag, as provided by the drag initiator.
     *
     * #### Notes
     * For advanced applications, the drag initiator may wish to expose
     * a source object to the drop targets. That will be provided here
     * if given by the drag initiator, otherwise it will be `null`.
     */
    readonly source: any;
  }

  /**
   * The namespace for the `Event` class statics.
   */
  export namespace Event {
    /**
     * An options object for initializing a `Drag` object.
     */
    export interface IOptions {
      /**
       * The drag object to use for seeding the drag data.
       */
      drag: Drag;

      /**
       * The related target for the event, or `null`.
       */
      related: Element | null;

      /**
       * The drag event type.
       */
      type:
        | 'lm-dragenter'
        | 'lm-dragexit'
        | 'lm-dragleave'
        | 'lm-dragover'
        | 'lm-drop';
    }
  }

  /**
   * Override the cursor icon for the entire document.
   *
   * @param cursor - The string representing the cursor style.
   *
   * @returns A disposable which will clear the override when disposed.
   *
   * #### Notes
   * The most recent call to `overrideCursor` takes precedence.
   * Disposing an old override has no effect on the current override.
   *
   * This utility function is used by the `Drag` class to override the
   * mouse cursor during a drag-drop operation, but it can also be used
   * by other classes to fix the cursor icon during normal mouse drags.
   *
   * #### Example
   * ```typescript
   * import { Drag } from '../dragdrop';
   *
   * // Force the cursor to be 'wait' for the entire document.
   * let override = Drag.overrideCursor('wait');
   *
   * // Clear the override by disposing the return value.
   * override.dispose();
   * ```
   */
  export function overrideCursor(
    cursor: string,
    doc: Document | ShadowRoot = document,
  ): IDisposable {
    return Private.overrideCursor(cursor, doc);
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * backdrop boundary used for lm-dragdrop-backdrop element transform offset
   */
  export let backdropTransform: Drag.BackDropTransform | undefined;

  /**
   * The size of a drag scroll edge, in pixels.
   */
  export const SCROLL_EDGE_SIZE = 20;

  /**
   * Validate the given action is one of the supported actions.
   *
   * Returns the given action or `'none'` if the action is unsupported.
   */
  export function validateAction(
    action: Drag.DropAction,
    supported: Drag.SupportedActions,
  ): Drag.DropAction {
    return actionTable[action] & supportedTable[supported] ? action : 'none';
  }

  /**
   * An object which holds the scroll target data.
   */
  export interface IScrollTarget {
    /**
     * The element to be scrolled.
     */
    element: Element;

    /**
     * The scroll edge underneath the mouse.
     */
    edge: 'top' | 'left' | 'right' | 'bottom';

    /**
     * The distance from the mouse to the scroll edge.
     */
    distance: number;
  }

  /**
   * Find the event target using pointer position if given, or otherwise
   * the central position of the backdrop.
   */
  export function findElementBehindBackdrop(
    event?: PointerEvent,
    root: Document | ShadowRoot = document,
  ) {
    if (event) {
      // Check if we already cached element for this event.
      if (lastElementEventSearch && event == lastElementEventSearch.event) {
        return lastElementEventSearch.element;
      }
      Private.cursorBackdrop.style.zIndex = '-1000';
      const element: Element | null = root.elementFromPoint(
        event.clientX,
        event.clientY,
      );
      Private.cursorBackdrop.style.zIndex = '';
      lastElementEventSearch = { event, element };
      return element;
    } else {
      const { transform } = cursorBackdrop.style;
      if (lastElementSearch && transform === lastElementSearch.transform) {
        return lastElementSearch.element;
      }
      const bbox = Private.cursorBackdrop.getBoundingClientRect();
      Private.cursorBackdrop.style.zIndex = '-1000';
      const element = root.elementFromPoint(
        bbox.left + bbox.width / 2,
        bbox.top + bbox.height / 2,
      );
      Private.cursorBackdrop.style.zIndex = '';
      lastElementSearch = { transform, element };
      return element;
    }
  }

  let lastElementEventSearch: {
    event: PointerEvent;
    element: Element | null;
  } | null = null;
  let lastElementSearch: {
    transform: string;
    element: Element | null;
  } | null = null;

  /**
   * Find the drag scroll target under the mouse, if any.
   */
  export function findScrollTarget(event: PointerEvent): IScrollTarget | null {
    // Look up the client mouse position.
    const x = event.clientX;
    const y = event.clientY;

    // Get the element under the mouse.
    let element: Element | null = findElementBehindBackdrop(event);

    // Search for a scrollable target based on the mouse position.
    // The null assert in third clause of for-loop is required due to:
    // https://github.com/Microsoft/TypeScript/issues/14143
    for (; element; element = element!.parentElement) {
      // Ignore elements which are not marked as scrollable.
      if (!element.hasAttribute('data-lm-dragscroll')) {
        continue;
      }

      // Set up the coordinate offsets for the element.
      let offsetX = 0;
      let offsetY = 0;
      if (element === document.body) {
        offsetX = window.pageXOffset;
        offsetY = window.pageYOffset;
      }

      // Get the element bounds in viewport coordinates.
      const r = element.getBoundingClientRect();
      const top = r.top + offsetY;
      const left = r.left + offsetX;
      const right = left + r.width;
      const bottom = top + r.height;

      // Skip the element if it's not under the mouse.
      if (x < left || x >= right || y < top || y >= bottom) {
        continue;
      }

      // Compute the distance to each edge.
      const dl = x - left + 1;
      const dt = y - top + 1;
      const dr = right - x;
      const db = bottom - y;

      // Find the smallest of the edge distances.
      const distance = Math.min(dl, dt, dr, db);

      // Skip the element if the mouse is not within a scroll edge.
      if (distance > SCROLL_EDGE_SIZE) {
        continue;
      }

      // Set up the edge result variable.
      let edge: 'top' | 'left' | 'right' | 'bottom';

      // Find the edge for the computed distance.
      switch (distance) {
        case db:
          edge = 'bottom';
          break;
        case dt:
          edge = 'top';
          break;
        case dr:
          edge = 'right';
          break;
        case dl:
          edge = 'left';
          break;
        default:
          throw 'unreachable';
      }

      // Compute how much the element can scroll in width and height.
      const dsw = element.scrollWidth - element.clientWidth;
      const dsh = element.scrollHeight - element.clientHeight;

      // Determine if the element should be scrolled for the edge.
      let shouldScroll: boolean;
      switch (edge) {
        case 'top':
          shouldScroll = dsh > 0 && element.scrollTop > 0;
          break;
        case 'left':
          shouldScroll = dsw > 0 && element.scrollLeft > 0;
          break;
        case 'right':
          shouldScroll = dsw > 0 && element.scrollLeft < dsw;
          break;
        case 'bottom':
          shouldScroll = dsh > 0 && element.scrollTop < dsh;
          break;
        default:
          throw 'unreachable';
      }

      // Skip the element if it should not be scrolled.
      if (!shouldScroll) {
        continue;
      }

      // Return the drag scroll target.
      return { element, edge, distance };
    }

    // No drag scroll target was found.
    return null;
  }

  /**
   * Dispatch a drag enter event to the indicated element.
   *
   * @param drag - The drag object associated with the action.
   *
   * @param currElem - The currently indicated element, or `null`. This
   *   is the "immediate user selection" from the whatwg spec.
   *
   * @param currTarget - The current drag target element, or `null`. This
   *   is the "current target element" from the whatwg spec.
   *
   * @param event - The mouse event related to the action.
   *
   * @returns The element to use as the current drag target. This is the
   *   "current target element" from the whatwg spec, and may be `null`.
   *
   * #### Notes
   * This largely implements the drag enter portion of the whatwg spec:
   * https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
   */
  export function dispatchDragEnter(
    drag: Drag,
    currElem: Element | null,
    currTarget: Element | null,
    event: PointerEvent,
  ): Element | null {
    // If the current element is null, return null as the new target.
    if (!currElem) {
      return null;
    }

    // Dispatch a drag enter event to the current element.
    let dragEvent = new Drag.Event(event, {
      drag,
      related: currTarget,
      type: 'lm-dragenter',
    });
    const canceled = !currElem.dispatchEvent(dragEvent);

    // If the event was canceled, use the current element as the new target.
    if (canceled) {
      return currElem;
    }

    // If the current element is the document body, keep the original target.
    const body =
      drag.document instanceof Document
        ? drag.document.body
        : (drag.document.firstElementChild as HTMLElement);

    if (currElem === body) {
      return currTarget;
    }

    // Dispatch a drag enter event on the document body.
    dragEvent = new Drag.Event(event, {
      drag,
      related: currTarget,
      type: 'lm-dragenter',
    });
    body.dispatchEvent(dragEvent);

    // Ignore the event cancellation, and use the body as the new target.
    return body;
  }

  /**
   * Dispatch a drag exit event to the indicated element.
   *
   * @param drag - The drag object associated with the action.
   *
   * @param prevTarget - The previous target element, or `null`. This
   *   is the previous "current target element" from the whatwg spec.
   *
   * @param currTarget - The current drag target element, or `null`. This
   *   is the "current target element" from the whatwg spec.
   *
   * @param event - The mouse event related to the action.
   *
   * #### Notes
   * This largely implements the drag exit portion of the whatwg spec:
   * https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
   */
  export function dispatchDragExit(
    drag: Drag,
    prevTarget: Element | null,
    currTarget: Element | null,
    event: PointerEvent,
  ): void {
    // If the previous target is null, do nothing.
    if (!prevTarget) {
      return;
    }

    // Dispatch the drag exit event to the previous target.
    const dragEvent = new Drag.Event(event, {
      drag,
      related: currTarget,
      type: 'lm-dragexit',
    });
    prevTarget.dispatchEvent(dragEvent);
  }

  /**
   * Dispatch a drag leave event to the indicated element.
   *
   * @param drag - The drag object associated with the action.
   *
   * @param prevTarget - The previous target element, or `null`. This
   *   is the previous "current target element" from the whatwg spec.
   *
   * @param currTarget - The current drag target element, or `null`. This
   *   is the "current target element" from the whatwg spec.
   *
   * @param event - The mouse event related to the action.
   *
   * #### Notes
   * This largely implements the drag leave portion of the whatwg spec:
   * https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
   */
  export function dispatchDragLeave(
    drag: Drag,
    prevTarget: Element | null,
    currTarget: Element | null,
    event: PointerEvent,
  ): void {
    // If the previous target is null, do nothing.
    if (!prevTarget) {
      return;
    }

    // Dispatch the drag leave event to the previous target.
    const dragEvent = new Drag.Event(event, {
      drag,
      related: currTarget,
      type: 'lm-dragleave',
    });
    prevTarget.dispatchEvent(dragEvent);
  }

  /**
   * Dispatch a drag over event to the indicated element.
   *
   * @param drag - The drag object associated with the action.
   *
   * @param currTarget - The current drag target element, or `null`. This
   *   is the "current target element" from the whatwg spec.
   *
   * @param event - The mouse event related to the action.
   *
   * @returns The `DropAction` result of the drag over event.
   *
   * #### Notes
   * This largely implements the drag over portion of the whatwg spec:
   * https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
   */
  export function dispatchDragOver(
    drag: Drag,
    currTarget: Element | null,
    event: PointerEvent,
  ): Drag.DropAction {
    // If there is no current target, the drop action is none.
    if (!currTarget) {
      return 'none';
    }

    // Dispatch the drag over event to the current target.
    const dragEvent = new Drag.Event(event, {
      drag,
      related: null,
      type: 'lm-dragover',
    });
    const canceled = !currTarget.dispatchEvent(dragEvent);

    // If the event was canceled, return the drop action result.
    if (canceled) {
      return dragEvent.dropAction;
    }

    // Otherwise, the effective drop action is none.
    return 'none';
  }

  /**
   * Dispatch a drop event to the indicated element.
   *
   * @param drag - The drag object associated with the action.
   *
   * @param currTarget - The current drag target element, or `null`. This
   *   is the "current target element" from the whatwg spec.
   *
   * @param event - The mouse event related to the action.
   *
   * @returns The `DropAction` result of the drop event.
   *
   * #### Notes
   * This largely implements the drag over portion of the whatwg spec:
   * https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
   */
  export function dispatchDrop(
    drag: Drag,
    currTarget: Element | null,
    event: PointerEvent,
  ): Drag.DropAction {
    // If there is no current target, the drop action is none.
    if (!currTarget) {
      return 'none';
    }

    // Dispatch the drop event to the current target.
    const dragEvent = new Drag.Event(event, {
      drag,
      related: null,
      type: 'lm-drop',
    });
    const canceled = !currTarget.dispatchEvent(dragEvent);

    // If the event was canceled, return the drop action result.
    if (canceled) {
      return dragEvent.dropAction;
    }

    // Otherwise, the effective drop action is none.
    return 'none';
  }

  /**
   * A lookup table from drop action to bit value.
   */
  const actionTable: { [key: string]: number } = {
    none: 0x0,
    copy: 0x1,
    link: 0x2,
    move: 0x4,
  };

  /**
   * A lookup table from supported action to drop action bit mask.
   */
  const supportedTable: { [key: string]: number } = {
    none: actionTable.none,
    copy: actionTable.copy,
    link: actionTable.link,
    move: actionTable.move,
    'copy-link': actionTable.copy | actionTable.link,
    'copy-move': actionTable.copy | actionTable.move,
    'link-move': actionTable.link | actionTable.move,
    all: actionTable.copy | actionTable.link | actionTable.move,
  };

  /**
   * Implementation of `Drag.overrideCursor`.
   */
  export function overrideCursor(
    cursor: string,
    doc: Document | ShadowRoot = document,
  ): IDisposable {
    const id = ++overrideCursorID;
    const body =
      doc instanceof Document
        ? doc.body
        : (doc.firstElementChild as HTMLElement);
    if (!cursorBackdrop.isConnected) {
      // Hide the backdrop until the pointer moves to avoid issues with
      // native double click detection, used in e.g. datagrid editing.
      cursorBackdrop.style.transform = 'scale(0)';
      body.appendChild(cursorBackdrop);
      resetBackdropScroll();
      document.addEventListener('pointermove', alignBackdrop, {
        capture: true,
        passive: true,
      });
      cursorBackdrop.addEventListener('scroll', propagateBackdropScroll, {
        capture: true,
        passive: true,
      });
    }
    cursorBackdrop.style.cursor = cursor;
    return new DisposableDelegate(() => {
      if (id === overrideCursorID && cursorBackdrop.isConnected) {
        document.removeEventListener('pointermove', alignBackdrop, true);
        cursorBackdrop.removeEventListener(
          'scroll',
          propagateBackdropScroll,
          true,
        );
        body.removeChild(cursorBackdrop);
      }
    });
  }

  /**
   * Move cursor backdrop to match cursor position.
   */
  function alignBackdrop(event: PointerEvent) {
    if (!cursorBackdrop) {
      return;
    }
    const clientX =
      Private.backdropTransform?.clientX?.(event.clientX) || event.clientX;
    const clientY =
      Private.backdropTransform?.clientY?.(event.clientY) || event.clientY;
    cursorBackdrop.style.transform = `translate(${clientX}px, ${clientY}px)`;
  }

  /**
   * Propagate the scroll event from the backdrop element to the scroll target.
   * The scroll target is defined by presence of `data-lm-dragscroll` attribute.
   */
  function propagateBackdropScroll(_event: Event) {
    if (!cursorBackdrop) {
      return;
    }
    // Get the element under behind the centre of the cursor backdrop
    // (essentially behind the cursor, but possibly a few pixels off).
    const element: Element | null = findElementBehindBackdrop();
    if (!element) {
      return;
    }
    // Find scroll target.
    const scrollTarget = element.closest('[data-lm-dragscroll]');
    if (!scrollTarget) {
      return;
    }
    // Apply the scroll delta to the correct target.
    scrollTarget.scrollTop += cursorBackdrop.scrollTop - backdropScrollOrigin;
    scrollTarget.scrollLeft += cursorBackdrop.scrollLeft - backdropScrollOrigin;

    // Center the scroll position.
    resetBackdropScroll();
  }

  /**
   * Reset the backdrop scroll to allow further scrolling.
   */
  function resetBackdropScroll() {
    cursorBackdrop.scrollTop = backdropScrollOrigin;
    cursorBackdrop.scrollLeft = backdropScrollOrigin;
  }

  /**
   * The center of the backdrop node scroll area.
   */
  const backdropScrollOrigin = 500;

  /**
   * Create cursor backdrop node.
   */
  function createCursorBackdrop(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.classList.add('lm-cursor-backdrop');
    return backdrop;
  }

  /**
   * The internal id for the active cursor override.
   */
  let overrideCursorID = 0;

  /**
   * A backdrop node overriding pointer cursor.
   *
   * #### Notes
   * We use a backdrop node rather than setting the cursor directly on the body
   * because setting it on body requires more extensive style recalculation for
   * reliable application of the cursor, this is the cursor not being overriden
   * when over child elements with another style like `cursor: other!important`.
   */
  export const cursorBackdrop: HTMLElement = createCursorBackdrop();
}
