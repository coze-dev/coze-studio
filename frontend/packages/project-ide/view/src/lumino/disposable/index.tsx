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
/**
 * @packageDocumentation
 * @module disposable
 */
import { type ISignal, Signal } from '../signaling';

/**
 * An object which implements the disposable pattern.
 */
export interface IDisposable {
  /**
   * Test whether the object has been disposed.
   *
   * #### Notes
   * This property is always safe to access.
   */
  readonly isDisposed: boolean;

  /**
   * Dispose of the resources held by the object.
   *
   * #### Notes
   * If the object's `dispose` method is called more than once, all
   * calls made after the first will be a no-op.
   *
   * #### Undefined Behavior
   * It is undefined behavior to use any functionality of the object
   * after it has been disposed unless otherwise explicitly noted.
   */
  dispose(): void;
}

/**
 * A disposable object with an observable `disposed` signal.
 */
export interface IObservableDisposable extends IDisposable {
  /**
   * A signal emitted when the object is disposed.
   */
  readonly disposed: ISignal<this, void>;
}

/**
 * A disposable object which delegates to a callback function.
 */
export class DisposableDelegate implements IDisposable {
  /**
   * Construct a new disposable delegate.
   *
   * @param fn - The callback function to invoke on dispose.
   */
  constructor(fn: () => void) {
    this._fn = fn;
  }

  /**
   * Test whether the delegate has been disposed.
   */
  get isDisposed(): boolean {
    return !this._fn;
  }

  /**
   * Dispose of the delegate and invoke the callback function.
   */
  dispose(): void {
    if (!this._fn) {
      return;
    }
    const fn = this._fn;
    this._fn = null;
    fn();
  }

  private _fn: (() => void) | null;
}

/**
 * An observable disposable object which delegates to a callback function.
 */
export class ObservableDisposableDelegate
  extends DisposableDelegate
  implements IObservableDisposable
{
  /**
   * A signal emitted when the delegate is disposed.
   */
  get disposed(): ISignal<this, void> {
    return this._disposed;
  }

  /**
   * Dispose of the delegate and invoke the callback function.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    this._disposed.emit(undefined);
    Signal.clearData(this);
  }

  private _disposed = new Signal<this, void>(this);
}

/**
 * An object which manages a collection of disposable items.
 */
export class DisposableSet implements IDisposable {
  /**
   * Test whether the set has been disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the set and the items it contains.
   *
   * #### Notes
   * Items are disposed in the order they are added to the set.
   */
  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._items.forEach(item => {
      item.dispose();
    });
    this._items.clear();
  }

  /**
   * Test whether the set contains a specific item.
   *
   * @param item - The item of interest.
   *
   * @returns `true` if the set contains the item, `false` otherwise.
   */
  contains(item: IDisposable): boolean {
    return this._items.has(item);
  }

  /**
   * Add a disposable item to the set.
   *
   * @param item - The item to add to the set.
   *
   * #### Notes
   * If the item is already contained in the set, this is a no-op.
   */
  add(item: IDisposable): void {
    this._items.add(item);
  }

  /**
   * Remove a disposable item from the set.
   *
   * @param item - The item to remove from the set.
   *
   * #### Notes
   * If the item is not contained in the set, this is a no-op.
   */
  remove(item: IDisposable): void {
    this._items.delete(item);
  }

  /**
   * Remove all items from the set.
   */
  clear(): void {
    this._items.clear();
  }

  private _isDisposed = false;

  private _items = new Set<IDisposable>();
}

/**
 * The namespace for the `DisposableSet` class statics.
 */
export namespace DisposableSet {
  /**
   * Create a disposable set from an iterable of items.
   *
   * @param items - The iterable object of interest.
   *
   * @returns A new disposable initialized with the given items.
   */
  export function from(items: Iterable<IDisposable>): DisposableSet {
    const set = new DisposableSet();
    for (const item of items) {
      set.add(item);
    }
    return set;
  }
}

/**
 * An observable object which manages a collection of disposable items.
 */
export class ObservableDisposableSet
  extends DisposableSet
  implements IObservableDisposable
{
  /**
   * A signal emitted when the set is disposed.
   */
  get disposed(): ISignal<this, void> {
    return this._disposed;
  }

  /**
   * Dispose of the set and the items it contains.
   *
   * #### Notes
   * Items are disposed in the order they are added to the set.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    this._disposed.emit(undefined);
    Signal.clearData(this);
  }

  private _disposed = new Signal<this, void>(this);
}

/**
 * The namespace for the `ObservableDisposableSet` class statics.
 */
export namespace ObservableDisposableSet {
  /**
   * Create an observable disposable set from an iterable of items.
   *
   * @param items - The iterable object of interest.
   *
   * @returns A new disposable initialized with the given items.
   */
  export function from(items: Iterable<IDisposable>): ObservableDisposableSet {
    const set = new ObservableDisposableSet();
    for (const item of items) {
      set.add(item);
    }
    return set;
  }
}
