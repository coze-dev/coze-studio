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
import { type IRetroable } from '../algorithm';

/**
 * A generic doubly-linked list.
 */
export class LinkedList<T> implements Iterable<T>, IRetroable<T> {
  /**
   * Whether the list is empty.
   *
   * #### Complexity
   * Constant.
   */
  get isEmpty(): boolean {
    return this._size === 0;
  }

  /**
   * The size of the list.
   *
   * #### Complexity
   * `O(1)`
   *
   * #### Notes
   * This is equivalent to `length`.
   */
  get size(): number {
    return this._size;
  }

  /**
   * The length of the list.
   *
   * #### Complexity
   * Constant.
   *
   * #### Notes
   * This is equivalent to `size`.
   *
   * This property is deprecated.
   */
  get length(): number {
    return this._size;
  }

  /**
   * The first value in the list.
   *
   * This is `undefined` if the list is empty.
   *
   * #### Complexity
   * Constant.
   */
  get first(): T | undefined {
    return this._first ? this._first.value : undefined;
  }

  /**
   * The last value in the list.
   *
   * This is `undefined` if the list is empty.
   *
   * #### Complexity
   * Constant.
   */
  get last(): T | undefined {
    return this._last ? this._last.value : undefined;
  }

  /**
   * The first node in the list.
   *
   * This is `null` if the list is empty.
   *
   * #### Complexity
   * Constant.
   */
  get firstNode(): LinkedList.INode<T> | null {
    return this._first;
  }

  /**
   * The last node in the list.
   *
   * This is `null` if the list is empty.
   *
   * #### Complexity
   * Constant.
   */
  get lastNode(): LinkedList.INode<T> | null {
    return this._last;
  }

  /**
   * Create an iterator over the values in the list.
   *
   * @returns A new iterator starting with the first value.
   *
   * #### Complexity
   * Constant.
   */
  *[Symbol.iterator](): IterableIterator<T> {
    let node = this._first;
    while (node) {
      yield node.value;
      node = node.next;
    }
  }

  /**
   * Create a reverse iterator over the values in the list.
   *
   * @returns A new iterator starting with the last value.
   *
   * #### Complexity
   * Constant.
   */
  *retro(): IterableIterator<T> {
    let node = this._last;
    while (node) {
      yield node.value;
      node = node.prev;
    }
  }

  /**
   * Create an iterator over the nodes in the list.
   *
   * @returns A new iterator starting with the first node.
   *
   * #### Complexity
   * Constant.
   */
  *nodes(): IterableIterator<LinkedList.INode<T>> {
    let node = this._first;
    while (node) {
      yield node;
      node = node.next;
    }
  }

  /**
   * Create a reverse iterator over the nodes in the list.
   *
   * @returns A new iterator starting with the last node.
   *
   * #### Complexity
   * Constant.
   */
  *retroNodes(): IterableIterator<LinkedList.INode<T>> {
    let node = this._last;
    while (node) {
      yield node;
      node = node.prev;
    }
  }

  /**
   * Assign new values to the list, replacing all current values.
   *
   * @param values - The values to assign to the list.
   *
   * #### Complexity
   * Linear.
   */
  assign(values: Iterable<T>): void {
    this.clear();
    for (const value of values) {
      this.addLast(value);
    }
  }

  /**
   * Add a value to the end of the list.
   *
   * @param value - The value to add to the end of the list.
   *
   * #### Complexity
   * Constant.
   *
   * #### Notes
   * This is equivalent to `addLast`.
   */
  push(value: T): void {
    this.addLast(value);
  }

  /**
   * Remove and return the value at the end of the list.
   *
   * @returns The removed value, or `undefined` if the list is empty.
   *
   * #### Complexity
   * Constant.
   *
   * #### Notes
   * This is equivalent to `removeLast`.
   */
  pop(): T | undefined {
    return this.removeLast();
  }

  /**
   * Add a value to the beginning of the list.
   *
   * @param value - The value to add to the beginning of the list.
   *
   * #### Complexity
   * Constant.
   *
   * #### Notes
   * This is equivalent to `addFirst`.
   */
  shift(value: T): void {
    this.addFirst(value);
  }

  /**
   * Remove and return the value at the beginning of the list.
   *
   * @returns The removed value, or `undefined` if the list is empty.
   *
   * #### Complexity
   * Constant.
   *
   * #### Notes
   * This is equivalent to `removeFirst`.
   */
  unshift(): T | undefined {
    return this.removeFirst();
  }

  /**
   * Add a value to the beginning of the list.
   *
   * @param value - The value to add to the beginning of the list.
   *
   * @returns The list node which holds the value.
   *
   * #### Complexity
   * Constant.
   */
  addFirst(value: T): LinkedList.INode<T> {
    const node = new Private.LinkedListNode<T>(this, value);
    if (!this._first) {
      this._first = node;
      this._last = node;
    } else {
      node.next = this._first;
      this._first.prev = node;
      this._first = node;
    }
    this._size++;
    return node;
  }

  /**
   * Add a value to the end of the list.
   *
   * @param value - The value to add to the end of the list.
   *
   * @returns The list node which holds the value.
   *
   * #### Complexity
   * Constant.
   */
  addLast(value: T): LinkedList.INode<T> {
    const node = new Private.LinkedListNode<T>(this, value);
    if (!this._last) {
      this._first = node;
      this._last = node;
    } else {
      node.prev = this._last;
      this._last.next = node;
      this._last = node;
    }
    this._size++;
    return node;
  }

  /**
   * Insert a value before a specific node in the list.
   *
   * @param value - The value to insert before the reference node.
   *
   * @param ref - The reference node of interest. If this is `null`,
   *   the value will be added to the beginning of the list.
   *
   * @returns The list node which holds the value.
   *
   * #### Notes
   * The reference node must be owned by the list.
   *
   * #### Complexity
   * Constant.
   */
  insertBefore(value: T, ref: LinkedList.INode<T> | null): LinkedList.INode<T> {
    if (!ref || ref === this._first) {
      return this.addFirst(value);
    }
    if (!(ref instanceof Private.LinkedListNode) || ref.list !== this) {
      throw new Error('Reference node is not owned by the list.');
    }
    const node = new Private.LinkedListNode<T>(this, value);
    const _ref = ref as Private.LinkedListNode<T>;
    const prev = _ref.prev!;
    node.next = _ref;
    node.prev = prev;
    _ref.prev = node;
    prev.next = node;
    this._size++;
    return node;
  }

  /**
   * Insert a value after a specific node in the list.
   *
   * @param value - The value to insert after the reference node.
   *
   * @param ref - The reference node of interest. If this is `null`,
   *   the value will be added to the end of the list.
   *
   * @returns The list node which holds the value.
   *
   * #### Notes
   * The reference node must be owned by the list.
   *
   * #### Complexity
   * Constant.
   */
  insertAfter(value: T, ref: LinkedList.INode<T> | null): LinkedList.INode<T> {
    if (!ref || ref === this._last) {
      return this.addLast(value);
    }
    if (!(ref instanceof Private.LinkedListNode) || ref.list !== this) {
      throw new Error('Reference node is not owned by the list.');
    }
    const node = new Private.LinkedListNode<T>(this, value);
    const _ref = ref as Private.LinkedListNode<T>;
    const next = _ref.next!;
    node.next = next;
    node.prev = _ref;
    _ref.next = node;
    next.prev = node;
    this._size++;
    return node;
  }

  /**
   * Remove and return the value at the beginning of the list.
   *
   * @returns The removed value, or `undefined` if the list is empty.
   *
   * #### Complexity
   * Constant.
   */
  removeFirst(): T | undefined {
    const node = this._first;
    if (!node) {
      return undefined;
    }
    if (node === this._last) {
      this._first = null;
      this._last = null;
    } else {
      this._first = node.next;
      this._first!.prev = null;
    }
    node.list = null;
    node.next = null;
    node.prev = null;
    this._size--;
    return node.value;
  }

  /**
   * Remove and return the value at the end of the list.
   *
   * @returns The removed value, or `undefined` if the list is empty.
   *
   * #### Complexity
   * Constant.
   */
  removeLast(): T | undefined {
    const node = this._last;
    if (!node) {
      return undefined;
    }
    if (node === this._first) {
      this._first = null;
      this._last = null;
    } else {
      this._last = node.prev;
      this._last!.next = null;
    }
    node.list = null;
    node.next = null;
    node.prev = null;
    this._size--;
    return node.value;
  }

  /**
   * Remove a specific node from the list.
   *
   * @param node - The node to remove from the list.
   *
   * #### Complexity
   * Constant.
   *
   * #### Notes
   * The node must be owned by the list.
   */
  removeNode(node: LinkedList.INode<T>): void {
    if (!(node instanceof Private.LinkedListNode) || node.list !== this) {
      throw new Error('Node is not owned by the list.');
    }
    const _node = node as Private.LinkedListNode<T>;
    if (_node === this._first && _node === this._last) {
      this._first = null;
      this._last = null;
    } else if (_node === this._first) {
      this._first = _node.next;
      this._first!.prev = null;
    } else if (_node === this._last) {
      this._last = _node.prev;
      this._last!.next = null;
    } else {
      _node.next!.prev = _node.prev;
      _node.prev!.next = _node.next;
    }
    _node.list = null;
    _node.next = null;
    _node.prev = null;
    this._size--;
  }

  /**
   * Remove all values from the list.
   *
   * #### Complexity
   * Linear.
   */
  clear(): void {
    let node = this._first;
    while (node) {
      const { next } = node;
      node.list = null;
      node.prev = null;
      node.next = null;
      node = next;
    }
    this._first = null;
    this._last = null;
    this._size = 0;
  }

  private _first: Private.LinkedListNode<T> | null = null;

  private _last: Private.LinkedListNode<T> | null = null;

  private _size = 0;
}

/**
 * The namespace for the `LinkedList` class statics.
 */
export namespace LinkedList {
  /**
   * An object which represents a node in a linked list.
   *
   * #### Notes
   * User code will not create linked list nodes directly. Nodes
   * are created automatically when values are added to a list.
   */
  export interface INode<T> {
    /**
     * The linked list which created and owns the node.
     *
     * This will be `null` when the node is removed from the list.
     */
    readonly list: LinkedList<T> | null;

    /**
     * The next node in the list.
     *
     * This will be `null` when the node is the last node in the list
     * or when the node is removed from the list.
     */
    readonly next: INode<T> | null;

    /**
     * The previous node in the list.
     *
     * This will be `null` when the node is the first node in the list
     * or when the node is removed from the list.
     */
    readonly prev: INode<T> | null;

    /**
     * The user value stored in the node.
     */
    readonly value: T;
  }

  /**
   * Create a linked list from an iterable of values.
   *
   * @param values - The iterable object of interest.
   *
   * @returns A new linked list initialized with the given values.
   *
   * #### Complexity
   * Linear.
   */
  export function from<T>(values: Iterable<T>): LinkedList<T> {
    const list = new LinkedList<T>();
    list.assign(values);
    return list;
  }
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * The internal linked list node implementation.
   */
  export class LinkedListNode<T> {
    /**
     * The linked list which created and owns the node.
     */
    list: LinkedList<T> | null = null;

    /**
     * The next node in the list.
     */
    next: LinkedListNode<T> | null = null;

    /**
     * The previous node in the list.
     */
    prev: LinkedListNode<T> | null = null;

    /**
     * The user value stored in the node.
     */
    readonly value: T;

    /**
     * Construct a new linked list node.
     *
     * @param list - The list which owns the node.
     *
     * @param value - The value for the link.
     */
    constructor(list: LinkedList<T>, value: T) {
      this.list = list;
      this.value = value;
    }
  }
}
