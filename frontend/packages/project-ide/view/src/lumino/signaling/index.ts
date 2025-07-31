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
 * @module signaling
 */
import { PromiseDelegate } from '../coreutils';
import { ArrayExt, find } from '../algorithm';

/**
 * A type alias for a slot function.
 *
 * @param sender - The object emitting the signal.
 *
 * @param args - The args object emitted with the signal.
 *
 * #### Notes
 * A slot is invoked when a signal to which it is connected is emitted.
 */
export type Slot<T, U> = (sender: T, args: U) => void;

/**
 * An object used for type-safe inter-object communication.
 *
 * #### Notes
 * Signals provide a type-safe implementation of the publish-subscribe
 * pattern. An object (publisher) declares which signals it will emit,
 * and consumers connect callbacks (subscribers) to those signals. The
 * subscribers are invoked whenever the publisher emits the signal.
 */
export interface ISignal<T, U> {
  /**
   * Connect a slot to the signal.
   *
   * @param slot - The slot to invoke when the signal is emitted.
   *
   * @param thisArg - The `this` context for the slot. If provided,
   *   this must be a non-primitive object.
   *
   * @returns `true` if the connection succeeds, `false` otherwise.
   *
   * #### Notes
   * Slots are invoked in the order in which they are connected.
   *
   * Signal connections are unique. If a connection already exists for
   * the given `slot` and `thisArg`, this method returns `false`.
   *
   * A newly connected slot will not be invoked until the next time the
   * signal is emitted, even if the slot is connected while the signal
   * is dispatching.
   */
  connect(slot: Slot<T, U>, thisArg?: any): boolean;

  /**
   * Disconnect a slot from the signal.
   *
   * @param slot - The slot to disconnect from the signal.
   *
   * @param thisArg - The `this` context for the slot. If provided,
   *   this must be a non-primitive object.
   *
   * @returns `true` if the connection is removed, `false` otherwise.
   *
   * #### Notes
   * If no connection exists for the given `slot` and `thisArg`, this
   * method returns `false`.
   *
   * A disconnected slot will no longer be invoked, even if the slot
   * is disconnected while the signal is dispatching.
   */
  disconnect(slot: Slot<T, U>, thisArg?: any): boolean;
}

/**
 * An object that is both a signal and an async iterable.
 */
export interface IStream<T, U> extends ISignal<T, U>, AsyncIterable<U> {}

/**
 * A concrete implementation of `ISignal`.
 *
 * #### Example
 * ```typescript
 * import { ISignal, Signal } from '../signaling';
 *
 * class SomeClass {
 *
 *   constructor(name: string) {
 *     this.name = name;
 *   }
 *
 *   readonly name: string;
 *
 *   get valueChanged: ISignal<this, number> {
 *     return this._valueChanged;
 *   }
 *
 *   get value(): number {
 *     return this._value;
 *   }
 *
 *   set value(value: number) {
 *     if (value === this._value) {
 *       return;
 *     }
 *     this._value = value;
 *     this._valueChanged.emit(value);
 *   }
 *
 *   private _value = 0;
 *   private _valueChanged = new Signal<this, number>(this);
 * }
 *
 * function logger(sender: SomeClass, value: number): void {
 *   console.log(sender.name, value);
 * }
 *
 * let m1 = new SomeClass('foo');
 * let m2 = new SomeClass('bar');
 *
 * m1.valueChanged.connect(logger);
 * m2.valueChanged.connect(logger);
 *
 * m1.value = 42;  // logs: foo 42
 * m2.value = 17;  // logs: bar 17
 * ```
 */
export class Signal<T, U> implements ISignal<T, U> {
  /**
   * Construct a new signal.
   *
   * @param sender - The sender which owns the signal.
   */
  constructor(sender: T) {
    this.sender = sender;
  }

  /**
   * The sender which owns the signal.
   */
  readonly sender: T;

  /**
   * Connect a slot to the signal.
   *
   * @param slot - The slot to invoke when the signal is emitted.
   *
   * @param thisArg - The `this` context for the slot. If provided,
   *   this must be a non-primitive object.
   *
   * @returns `true` if the connection succeeds, `false` otherwise.
   */
  connect(slot: Slot<T, U>, thisArg?: unknown): boolean {
    return Private.connect(this, slot, thisArg);
  }

  /**
   * Disconnect a slot from the signal.
   *
   * @param slot - The slot to disconnect from the signal.
   *
   * @param thisArg - The `this` context for the slot. If provided,
   *   this must be a non-primitive object.
   *
   * @returns `true` if the connection is removed, `false` otherwise.
   */
  disconnect(slot: Slot<T, U>, thisArg?: unknown): boolean {
    return Private.disconnect(this, slot, thisArg);
  }

  /**
   * Emit the signal and invoke the connected slots.
   *
   * @param args - The args to pass to the connected slots.
   *
   * #### Notes
   * Slots are invoked synchronously in connection order.
   *
   * Exceptions thrown by connected slots will be caught and logged.
   */
  emit(args: U): void {
    Private.emit(this, args);
  }
}

/**
 * The namespace for the `Signal` class statics.
 */
export namespace Signal {
  /**
   * Remove all connections between a sender and receiver.
   *
   * @param sender - The sender object of interest.
   *
   * @param receiver - The receiver object of interest.
   *
   * #### Notes
   * If a `thisArg` is provided when connecting a signal, that object
   * is considered the receiver. Otherwise, the `slot` is considered
   * the receiver.
   */
  export function disconnectBetween(sender: unknown, receiver: unknown): void {
    Private.disconnectBetween(sender, receiver);
  }

  /**
   * Remove all connections where the given object is the sender.
   *
   * @param sender - The sender object of interest.
   */
  export function disconnectSender(sender: unknown): void {
    Private.disconnectSender(sender);
  }

  /**
   * Remove all connections where the given object is the receiver.
   *
   * @param receiver - The receiver object of interest.
   *
   * #### Notes
   * If a `thisArg` is provided when connecting a signal, that object
   * is considered the receiver. Otherwise, the `slot` is considered
   * the receiver.
   */
  export function disconnectReceiver(receiver: unknown): void {
    Private.disconnectReceiver(receiver);
  }

  /**
   * Remove all connections where an object is the sender or receiver.
   *
   * @param object - The object of interest.
   *
   * #### Notes
   * If a `thisArg` is provided when connecting a signal, that object
   * is considered the receiver. Otherwise, the `slot` is considered
   * the receiver.
   */
  export function disconnectAll(object: unknown): void {
    Private.disconnectAll(object);
  }

  /**
   * Clear all signal data associated with the given object.
   *
   * @param object - The object for which the data should be cleared.
   *
   * #### Notes
   * This removes all signal connections and any other signal data
   * associated with the object.
   */
  export function clearData(object: unknown): void {
    Private.disconnectAll(object);
  }

  /**
   * A type alias for the exception handler function.
   */
  export type ExceptionHandler = (err: Error) => void;

  /**
   * Get the signal exception handler.
   *
   * @returns The current exception handler.
   *
   * #### Notes
   * The default exception handler is `console.error`.
   */
  export function getExceptionHandler(): ExceptionHandler {
    return Private.exceptionHandler;
  }

  /**
   * Set the signal exception handler.
   *
   * @param handler - The function to use as the exception handler.
   *
   * @returns The old exception handler.
   *
   * #### Notes
   * The exception handler is invoked when a slot throws an exception.
   */
  export function setExceptionHandler(
    handler: ExceptionHandler,
  ): ExceptionHandler {
    const old = Private.exceptionHandler;
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore
    Private.exceptionHandler = handler;
    return old;
  }
}

/**
 * A concrete implementation of `IStream`.
 *
 * #### Example
 * ```typescript
 * import { IStream, Stream } from '../signaling';
 *
 * class SomeClass {
 *
 *   constructor(name: string) {
 *     this.name = name;
 *   }
 *
 *   readonly name: string;
 *
 *   get pings(): IStream<this, string> {
 *     return this._pings;
 *   }
 *
 *   ping(value: string) {
 *     this._pings.emit(value);
 *   }
 *
 *   private _pings = new Stream<this, string>(this);
 * }
 *
 * let m1 = new SomeClass('foo');
 *
 * m1.pings.connect((_, value: string) => {
 *   console.log('connect', value);
 * });
 *
 * void (async () => {
 *   for await (const ping of m1.pings) {
 *     console.log('iterator', ping);
 *   }
 * })();
 *
 * m1.ping('alpha');  // logs: connect alpha
 *                    // logs: iterator alpha
 * m1.ping('beta');   // logs: connect beta
 *                    // logs: iterator beta
 * ```
 */
export class Stream<T, U> extends Signal<T, U> implements IStream<T, U> {
  /**
   * Return an async iterator that yields every emission.
   */
  async *[Symbol.asyncIterator](): AsyncIterableIterator<U> {
    let pending = this._pending;
    while (true) {
      try {
        const { args, next } = await pending.promise;
        pending = next;
        yield args;
      } catch (_) {
        return; // Any promise rejection stops the iterator.
      }
    }
  }

  /**
   * Emit the signal, invoke the connected slots, and yield the emission.
   *
   * @param args - The args to pass to the connected slots.
   */
  emit(args: U): void {
    const pending = this._pending;
    const next = (this._pending = new PromiseDelegate());
    pending.resolve({ args, next });
    super.emit(args);
  }

  /**
   * Stop the stream's async iteration.
   */
  stop(): void {
    this._pending.promise.catch(() => undefined);
    this._pending.reject('stop');
    this._pending = new PromiseDelegate();
  }

  private _pending: Private.Pending<U> = new PromiseDelegate();
}

/**
 * The namespace for the module implementation details.
 */
namespace Private {
  /**
   * A pending promise in a promise chain underlying a stream.
   */
  export type Pending<U> = PromiseDelegate<{ args: U; next: Pending<U> }>;

  /**
   * The signal exception handler function.
   */
  export const exceptionHandler: Signal.ExceptionHandler = (err: Error) => {
    console.error(err);
  };

  /**
   * Connect a slot to a signal.
   *
   * @param signal - The signal of interest.
   *
   * @param slot - The slot to invoke when the signal is emitted.
   *
   * @param thisArg - The `this` context for the slot. If provided,
   *   this must be a non-primitive object.
   *
   * @returns `true` if the connection succeeds, `false` otherwise.
   */
  export function connect<T, U>(
    signal: Signal<T, U>,
    slot: Slot<T, U>,
    thisArg?: unknown,
  ): boolean {
    // Coerce a `null` `thisArg` to `undefined`.
    thisArg = thisArg || undefined;

    // Ensure the sender's array of receivers is created.
    let receivers = receiversForSender.get(signal.sender);
    if (!receivers) {
      receivers = [];
      receiversForSender.set(signal.sender, receivers);
    }

    // Bail if a matching connection already exists.
    if (findConnection(receivers, signal, slot, thisArg)) {
      return false;
    }

    // Choose the best object for the receiver.
    const receiver = thisArg || slot;

    // Ensure the receiver's array of senders is created.
    let senders = sendersForReceiver.get(receiver);
    if (!senders) {
      senders = [];
      sendersForReceiver.set(receiver, senders);
    }

    // Create a new connection and add it to the end of each array.
    const connection = { signal, slot, thisArg };
    receivers.push(connection);
    senders.push(connection);

    // Indicate a successful connection.
    return true;
  }

  /**
   * Disconnect a slot from a signal.
   *
   * @param signal - The signal of interest.
   *
   * @param slot - The slot to disconnect from the signal.
   *
   * @param thisArg - The `this` context for the slot. If provided,
   *   this must be a non-primitive object.
   *
   * @returns `true` if the connection is removed, `false` otherwise.
   */
  export function disconnect<T, U>(
    signal: Signal<T, U>,
    slot: Slot<T, U>,
    thisArg?: unknown,
  ): boolean {
    // Coerce a `null` `thisArg` to `undefined`.
    thisArg = thisArg || undefined;

    // Lookup the list of receivers, and bail if none exist.
    const receivers = receiversForSender.get(signal.sender);
    if (!receivers || receivers.length === 0) {
      return false;
    }

    // Bail if no matching connection exits.
    const connection = findConnection(receivers, signal, slot, thisArg);
    if (!connection) {
      return false;
    }

    // Choose the best object for the receiver.
    const receiver = thisArg || slot;

    // Lookup the array of senders, which is now known to exist.
    const senders = sendersForReceiver.get(receiver)!;

    // Clear the connection and schedule cleanup of the arrays.
    connection.signal = null;
    scheduleCleanup(receivers);
    scheduleCleanup(senders);

    // Indicate a successful disconnection.
    return true;
  }

  /**
   * Remove all connections between a sender and receiver.
   *
   * @param sender - The sender object of interest.
   *
   * @param receiver - The receiver object of interest.
   */
  export function disconnectBetween(sender: unknown, receiver: unknown): void {
    // If there are no receivers, there is nothing to do.
    const receivers = receiversForSender.get(sender);
    if (!receivers || receivers.length === 0) {
      return;
    }

    // If there are no senders, there is nothing to do.
    const senders = sendersForReceiver.get(receiver);
    if (!senders || senders.length === 0) {
      return;
    }

    // Clear each connection between the sender and receiver.
    for (const connection of senders) {
      // Skip connections which have already been cleared.
      if (!connection.signal) {
        continue;
      }

      // Clear the connection if it matches the sender.
      if (connection.signal.sender === sender) {
        connection.signal = null;
      }
    }

    // Schedule a cleanup of the senders and receivers.
    scheduleCleanup(receivers);
    scheduleCleanup(senders);
  }

  /**
   * Remove all connections where the given object is the sender.
   *
   * @param sender - The sender object of interest.
   */
  export function disconnectSender(sender: unknown): void {
    // If there are no receivers, there is nothing to do.
    const receivers = receiversForSender.get(sender);
    if (!receivers || receivers.length === 0) {
      return;
    }

    // Clear each receiver connection.
    for (const connection of receivers) {
      // Skip connections which have already been cleared.
      if (!connection.signal) {
        continue;
      }

      // Choose the best object for the receiver.
      const receiver = connection.thisArg || connection.slot;

      // Clear the connection.
      connection.signal = null;

      // Cleanup the array of senders, which is now known to exist.
      scheduleCleanup(sendersForReceiver.get(receiver)!);
    }

    // Schedule a cleanup of the receivers.
    scheduleCleanup(receivers);
  }

  /**
   * Remove all connections where the given object is the receiver.
   *
   * @param receiver - The receiver object of interest.
   */
  export function disconnectReceiver(receiver: unknown): void {
    // If there are no senders, there is nothing to do.
    const senders = sendersForReceiver.get(receiver);
    if (!senders || senders.length === 0) {
      return;
    }

    // Clear each sender connection.
    for (const connection of senders) {
      // Skip connections which have already been cleared.
      if (!connection.signal) {
        continue;
      }

      // Lookup the sender for the connection.
      const { sender } = connection.signal;

      // Clear the connection.
      connection.signal = null;

      // Cleanup the array of receivers, which is now known to exist.
      scheduleCleanup(receiversForSender.get(sender)!);
    }

    // Schedule a cleanup of the list of senders.
    scheduleCleanup(senders);
  }

  /**
   * Remove all connections where an object is the sender or receiver.
   *
   * @param object - The object of interest.
   */
  export function disconnectAll(object: unknown): void {
    // Remove all connections where the given object is the sender.
    disconnectSender(object);
    // Remove all connections where the given object is the receiver.
    disconnectReceiver(object);
  }

  /**
   * Emit a signal and invoke its connected slots.
   *
   * @param signal - The signal of interest.
   *
   * @param args - The args to pass to the connected slots.
   *
   * #### Notes
   * Slots are invoked synchronously in connection order.
   *
   * Exceptions thrown by connected slots will be caught and logged.
   */
  export function emit<T, U>(signal: Signal<T, U>, args: U): void {
    // If there are no receivers, there is nothing to do.
    const receivers = receiversForSender.get(signal.sender);
    if (!receivers || receivers.length === 0) {
      return;
    }

    // Invoke the slots for connections with a matching signal.
    // Any connections added during emission are not invoked.
    for (let i = 0, n = receivers.length; i < n; ++i) {
      const connection = receivers[i];
      if (connection.signal === signal) {
        invokeSlot(connection, args);
      }
    }
  }

  /**
   * An object which holds connection data.
   */
  interface IConnection {
    /**
     * The signal for the connection.
     *
     * A `null` signal indicates a cleared connection.
     */
    signal: Signal<any, any> | null;

    /**
     * The slot connected to the signal.
     */
    readonly slot: Slot<any, any>;

    /**
     * The `this` context for the slot.
     */
    readonly thisArg: any;
  }

  /**
   * A weak mapping of sender to array of receiver connections.
   */
  const receiversForSender = new WeakMap<any, IConnection[]>();

  /**
   * A weak mapping of receiver to array of sender connections.
   */
  const sendersForReceiver = new WeakMap<any, IConnection[]>();

  /**
   * A set of connection arrays which are pending cleanup.
   */
  const dirtySet = new Set<IConnection[]>();

  /**
   * A function to schedule an event loop callback.
   */
  const schedule = (() => {
    const ok = typeof requestAnimationFrame === 'function';
    return ok ? requestAnimationFrame : setImmediate;
  })();

  /**
   * Find a connection which matches the given parameters.
   */
  function findConnection(
    connections: IConnection[],
    signal: Signal<any, any>,
    slot: Slot<any, any>,
    thisArg: any,
  ): IConnection | undefined {
    return find(
      connections,
      connection =>
        connection.signal === signal &&
        connection.slot === slot &&
        connection.thisArg === thisArg,
    );
  }

  /**
   * Invoke a slot with the given parameters.
   *
   * The connection is assumed to be valid.
   *
   * Exceptions in the slot will be caught and logged.
   */
  function invokeSlot(connection: IConnection, args: any): void {
    const { signal, slot, thisArg } = connection;
    try {
      slot.call(thisArg, signal!.sender, args);
    } catch (err: unknown) {
      exceptionHandler(err as unknown as Error);
    }
  }

  /**
   * Schedule a cleanup of a connection array.
   *
   * This will add the array to the dirty set and schedule a deferred
   * cleanup of the array contents. On cleanup, any connection with a
   * `null` signal will be removed from the array.
   */
  function scheduleCleanup(array: IConnection[]): void {
    if (dirtySet.size === 0) {
      schedule(cleanupDirtySet);
    }
    dirtySet.add(array);
  }

  /**
   * Cleanup the connection lists in the dirty set.
   *
   * This function should only be invoked asynchronously, when the
   * stack frame is guaranteed to not be on the path of user code.
   */
  function cleanupDirtySet(): void {
    dirtySet.forEach(cleanupConnections);
    dirtySet.clear();
  }

  /**
   * Cleanup the dirty connections in a connections array.
   *
   * This will remove any connection with a `null` signal.
   *
   * This function should only be invoked asynchronously, when the
   * stack frame is guaranteed to not be on the path of user code.
   */
  function cleanupConnections(connections: IConnection[]): void {
    ArrayExt.removeAllWhere(connections, isDeadConnection);
  }

  /**
   * Test whether a connection is dead.
   *
   * A dead connection has a `null` signal.
   */
  function isDeadConnection(connection: IConnection): boolean {
    return connection.signal === null;
  }
}
