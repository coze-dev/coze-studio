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
 * @module messaging
 */
import { LinkedList } from '../collections';
import { ArrayExt, every, retro, some } from '../algorithm';

/**
 * A message which can be delivered to a message handler.
 *
 * #### Notes
 * This class may be subclassed to create complex message types.
 */
export class Message {
  /**
   * Construct a new message.
   *
   * @param type - The type of the message.
   */
  constructor(type: string) {
    this.type = type;
  }

  /**
   * The type of the message.
   *
   * #### Notes
   * The `type` of a message should be related directly to its actual
   * runtime type. This means that `type` can and will be used to cast
   * the message to the relevant derived `Message` subtype.
   */
  readonly type: string;

  /**
   * Test whether the message is conflatable.
   *
   * #### Notes
   * Message conflation is an advanced topic. Most message types will
   * not make use of this feature.
   *
   * If a conflatable message is posted to a handler while another
   * conflatable message of the same `type` has already been posted
   * to the handler, the `conflate()` method of the existing message
   * will be invoked. If that method returns `true`, the new message
   * will not be enqueued. This allows messages to be compressed, so
   * that only a single instance of the message type is processed per
   * cycle, no matter how many times messages of that type are posted.
   *
   * Custom message types may reimplement this property.
   *
   * The default implementation is always `false`.
   */
  get isConflatable(): boolean {
    return false;
  }

  /**
   * Conflate this message with another message of the same `type`.
   *
   * @param other - A conflatable message of the same `type`.
   *
   * @returns `true` if the message was successfully conflated, or
   *   `false` otherwise.
   *
   * #### Notes
   * Message conflation is an advanced topic. Most message types will
   * not make use of this feature.
   *
   * This method is called automatically by the message loop when the
   * given message is posted to the handler paired with this message.
   * This message will already be enqueued and conflatable, and the
   * given message will have the same `type` and also be conflatable.
   *
   * This method should merge the state of the other message into this
   * message as needed so that when this message is finally delivered
   * to the handler, it receives the most up-to-date information.
   *
   * If this method returns `true`, it signals that the other message
   * was successfully conflated and that message will not be enqueued.
   *
   * If this method returns `false`, the other message will be enqueued
   * for normal delivery.
   *
   * Custom message types may reimplement this method.
   *
   * The default implementation always returns `false`.
   */
  conflate(other: Message): boolean {
    return false;
  }
}

/**
 * A convenience message class which conflates automatically.
 *
 * #### Notes
 * Message conflation is an advanced topic. Most user code will not
 * make use of this class.
 *
 * This message class is useful for creating message instances which
 * should be conflated, but which have no state other than `type`.
 *
 * If conflation of stateful messages is required, a custom `Message`
 * subclass should be created.
 */
export class ConflatableMessage extends Message {
  /**
   * Test whether the message is conflatable.
   *
   * #### Notes
   * This property is always `true`.
   */
  get isConflatable(): boolean {
    return true;
  }

  /**
   * Conflate this message with another message of the same `type`.
   *
   * #### Notes
   * This method always returns `true`.
   */
  conflate(other: ConflatableMessage): boolean {
    return true;
  }
}

/**
 * An object which handles messages.
 *
 * #### Notes
 * A message handler is a simple way of defining a type which can act
 * upon on a large variety of external input without requiring a large
 * abstract API surface. This is particularly useful in the context of
 * widget frameworks where the number of distinct message types can be
 * unbounded.
 */
export interface IMessageHandler {
  /**
   * Process a message sent to the handler.
   *
   * @param msg - The message to be processed.
   */
  processMessage(msg: Message): void;
}

/**
 * An object which intercepts messages sent to a message handler.
 *
 * #### Notes
 * A message hook is useful for intercepting or spying on messages
 * sent to message handlers which were either not created by the
 * consumer, or when subclassing the handler is not feasible.
 *
 * If `messageHook` returns `false`, no other message hooks will be
 * invoked and the message will not be delivered to the handler.
 *
 * If all installed message hooks return `true`, the message will
 * be delivered to the handler for processing.
 *
 * **See also:** {@link MessageLoop.installMessageHook} and {@link MessageLoop.removeMessageHook}
 */
export interface IMessageHook {
  /**
   * Intercept a message sent to a message handler.
   *
   * @param handler - The target handler of the message.
   *
   * @param msg - The message to be sent to the handler.
   *
   * @returns `true` if the message should continue to be processed
   *   as normal, or `false` if processing should cease immediately.
   */
  messageHook(handler: IMessageHandler, msg: Message): boolean;
}

/**
 * A type alias for message hook object or function.
 *
 * #### Notes
 * The signature and semantics of a message hook function are the same
 * as the `messageHook` method of {@link IMessageHook}.
 */
export type MessageHook =
  | IMessageHook
  | ((handler: IMessageHandler, msg: Message) => boolean);

/**
 * The namespace for the global singleton message loop.
 */
export namespace MessageLoop {
  /**
   * A function that cancels the pending loop task; `null` if unavailable.
   */
  let pending: (() => void) | null = null;

  /**
   * Schedules a function for invocation as soon as possible asynchronously.
   *
   * @param fn The function to invoke when called back.
   *
   * @returns An anonymous function that will unschedule invocation if possible.
   */
  const schedule = (
    resolved =>
    (fn: () => unknown): (() => void) => {
      let rejected = false;
      resolved.then(() => !rejected && fn());
      return () => {
        rejected = true;
      };
    }
  )(Promise.resolve());

  /**
   * Send a message to a message handler to process immediately.
   *
   * @param handler - The handler which should process the message.
   *
   * @param msg - The message to deliver to the handler.
   *
   * #### Notes
   * The message will first be sent through any installed message hooks
   * for the handler. If the message passes all hooks, it will then be
   * delivered to the `processMessage` method of the handler.
   *
   * The message will not be conflated with pending posted messages.
   *
   * Exceptions in hooks and handlers will be caught and logged.
   */
  export function sendMessage(handler: IMessageHandler, msg: Message): void {
    // Lookup the message hooks for the handler.
    const hooks = messageHooks.get(handler);

    // Handle the common case of no installed hooks.
    if (!hooks || hooks.length === 0) {
      invokeHandler(handler, msg);
      return;
    }

    // Invoke the message hooks starting with the newest first.
    const passed = every(retro(hooks), hook =>
      hook ? invokeHook(hook, handler, msg) : true,
    );

    // Invoke the handler if the message passes all hooks.
    if (passed) {
      invokeHandler(handler, msg);
    }
  }

  /**
   * Post a message to a message handler to process in the future.
   *
   * @param handler - The handler which should process the message.
   *
   * @param msg - The message to post to the handler.
   *
   * #### Notes
   * The message will be conflated with the pending posted messages for
   * the handler, if possible. If the message is not conflated, it will
   * be queued for normal delivery on the next cycle of the event loop.
   *
   * Exceptions in hooks and handlers will be caught and logged.
   */
  export function postMessage(handler: IMessageHandler, msg: Message): void {
    // Handle the common case of a non-conflatable message.
    if (!msg.isConflatable) {
      enqueueMessage(handler, msg);
      return;
    }

    // Conflate the message with an existing message if possible.
    const conflated = some(messageQueue, posted => {
      if (posted.handler !== handler) {
        return false;
      }
      if (!posted.msg) {
        return false;
      }
      if (posted.msg.type !== msg.type) {
        return false;
      }
      if (!posted.msg.isConflatable) {
        return false;
      }
      return posted.msg.conflate(msg);
    });

    // Enqueue the message if it was not conflated.
    if (!conflated) {
      enqueueMessage(handler, msg);
    }
  }

  /**
   * Install a message hook for a message handler.
   *
   * @param handler - The message handler of interest.
   *
   * @param hook - The message hook to install.
   *
   * #### Notes
   * A message hook is invoked before a message is delivered to the
   * handler. If the hook returns `false`, no other hooks will be
   * invoked and the message will not be delivered to the handler.
   *
   * The most recently installed message hook is executed first.
   *
   * If the hook is already installed, this is a no-op.
   */
  export function installMessageHook(
    handler: IMessageHandler,
    hook: MessageHook,
  ): void {
    // Look up the hooks for the handler.
    const hooks = messageHooks.get(handler);

    // Bail early if the hook is already installed.
    if (hooks && hooks.indexOf(hook) !== -1) {
      return;
    }

    // Add the hook to the end, so it will be the first to execute.
    if (!hooks) {
      messageHooks.set(handler, [hook]);
    } else {
      hooks.push(hook);
    }
  }

  /**
   * Remove an installed message hook for a message handler.
   *
   * @param handler - The message handler of interest.
   *
   * @param hook - The message hook to remove.
   *
   * #### Notes
   * It is safe to call this function while the hook is executing.
   *
   * If the hook is not installed, this is a no-op.
   */
  export function removeMessageHook(
    handler: IMessageHandler,
    hook: MessageHook,
  ): void {
    // Lookup the hooks for the handler.
    const hooks = messageHooks.get(handler);

    // Bail early if the hooks do not exist.
    if (!hooks) {
      return;
    }

    // Lookup the index of the hook and bail if not found.
    const i = hooks.indexOf(hook);
    if (i === -1) {
      return;
    }

    // Clear the hook and schedule a cleanup of the array.
    hooks[i] = null;
    scheduleCleanup(hooks);
  }

  /**
   * Clear all message data associated with a message handler.
   *
   * @param handler - The message handler of interest.
   *
   * #### Notes
   * This will clear all posted messages and hooks for the handler.
   */
  export function clearData(handler: IMessageHandler): void {
    // Lookup the hooks for the handler.
    const hooks = messageHooks.get(handler);

    // Clear all messsage hooks for the handler.
    if (hooks && hooks.length > 0) {
      ArrayExt.fill(hooks, null);
      scheduleCleanup(hooks);
    }

    // Clear all posted messages for the handler.
    for (const posted of messageQueue) {
      if (posted.handler === handler) {
        posted.handler = null;
        posted.msg = null;
      }
    }
  }

  /**
   * Process the pending posted messages in the queue immediately.
   *
   * #### Notes
   * This function is useful when posted messages must be processed immediately.
   *
   * This function should normally not be needed, but it may be
   * required to work around certain browser idiosyncrasies.
   *
   * Recursing into this function is a no-op.
   */
  export function flush(): void {
    // Bail if recursion is detected or if there is no pending task.
    if (flushGuard || pending === null) {
      return;
    }

    // Unschedule the pending loop task.
    pending();
    pending = null;

    // Run the message loop within the recursion guard.
    flushGuard = true;
    runMessageLoop();
    flushGuard = false;
  }

  /**
   * A type alias for the exception handler function.
   */
  export type ExceptionHandler = (err: Error) => void;

  /**
   * Get the message loop exception handler.
   *
   * @returns The current exception handler.
   *
   * #### Notes
   * The default exception handler is `console.error`.
   */
  export function getExceptionHandler(): ExceptionHandler {
    return exceptionHandler;
  }

  /**
   * Set the message loop exception handler.
   *
   * @param handler - The function to use as the exception handler.
   *
   * @returns The old exception handler.
   *
   * #### Notes
   * The exception handler is invoked when a message handler or a
   * message hook throws an exception.
   */
  export function setExceptionHandler(
    handler: ExceptionHandler,
  ): ExceptionHandler {
    const old = exceptionHandler;
    exceptionHandler = handler;
    return old;
  }

  /**
   * A type alias for a posted message pair.
   */
  interface PostedMessage {
    handler: IMessageHandler | null;
    msg: Message | null;
  }

  /**
   * The queue of posted message pairs.
   */
  const messageQueue = new LinkedList<PostedMessage>();

  /**
   * A mapping of handler to array of installed message hooks.
   */
  const messageHooks = new WeakMap<
    IMessageHandler,
    Array<MessageHook | null>
  >();

  /**
   * A set of message hook arrays which are pending cleanup.
   */
  const dirtySet = new Set<Array<MessageHook | null>>();

  /**
   * The message loop exception handler.
   */
  let exceptionHandler: ExceptionHandler = (err: Error) => {
    console.error(err);
  };

  /**
   * A guard flag to prevent flush recursion.
   */
  let flushGuard = false;

  /**
   * Invoke a message hook with the specified handler and message.
   *
   * Returns the result of the hook, or `true` if the hook throws.
   *
   * Exceptions in the hook will be caught and logged.
   */
  function invokeHook(
    hook: MessageHook,
    handler: IMessageHandler,
    msg: Message,
  ): boolean {
    let result = true;
    try {
      if (typeof hook === 'function') {
        result = hook(handler, msg);
      } else {
        result = hook.messageHook(handler, msg);
      }
    } catch (err) {
      exceptionHandler(err as Error);
    }
    return result;
  }

  /**
   * Invoke a message handler with the specified message.
   *
   * Exceptions in the handler will be caught and logged.
   */
  function invokeHandler(handler: IMessageHandler, msg: Message): void {
    try {
      handler.processMessage(msg);
    } catch (err) {
      exceptionHandler(err as Error);
    }
  }

  /**
   * Add a message to the end of the message queue.
   *
   * This will automatically schedule a run of the message loop.
   */
  function enqueueMessage(handler: IMessageHandler, msg: Message): void {
    // Add the posted message to the queue.
    messageQueue.addLast({ handler, msg });

    // Bail if a loop task is already pending.
    if (pending !== null) {
      return;
    }

    // Schedule a run of the message loop.
    pending = schedule(runMessageLoop);
  }

  /**
   * Run an iteration of the message loop.
   *
   * This will process all pending messages in the queue. If a message
   * is added to the queue while the message loop is running, it will
   * be processed on the next cycle of the loop.
   */
  function runMessageLoop(): void {
    // Clear the task so the next loop can be scheduled.
    pending = null;

    // If the message queue is empty, there is nothing else to do.
    if (messageQueue.isEmpty) {
      return;
    }

    // Add a sentinel value to the end of the queue. The queue will
    // only be processed up to the sentinel. Messages posted during
    // this cycle will execute on the next cycle.
    const sentinel: PostedMessage = { handler: null, msg: null };
    messageQueue.addLast(sentinel);

    // Enter the message loop.

    while (true) {
      // Remove the first posted message in the queue.
      const posted = messageQueue.removeFirst()!;

      // If the value is the sentinel, exit the loop.
      if (posted === sentinel) {
        return;
      }

      // Dispatch the message if it has not been cleared.
      if (posted.handler && posted.msg) {
        sendMessage(posted.handler, posted.msg);
      }
    }
  }

  /**
   * Schedule a cleanup of a message hooks array.
   *
   * This will add the array to the dirty set and schedule a deferred
   * cleanup of the array contents. On cleanup, any `null` hook will
   * be removed from the array.
   */
  function scheduleCleanup(hooks: Array<MessageHook | null>): void {
    if (dirtySet.size === 0) {
      schedule(cleanupDirtySet);
    }
    dirtySet.add(hooks);
  }

  /**
   * Cleanup the message hook arrays in the dirty set.
   *
   * This function should only be invoked asynchronously, when the
   * stack frame is guaranteed to not be on the path of user code.
   */
  function cleanupDirtySet(): void {
    dirtySet.forEach(cleanupHooks);
    dirtySet.clear();
  }

  /**
   * Cleanup the dirty hooks in a message hooks array.
   *
   * This will remove any `null` hook from the array.
   *
   * This function should only be invoked asynchronously, when the
   * stack frame is guaranteed to not be on the path of user code.
   */
  function cleanupHooks(hooks: Array<MessageHook | null>): void {
    ArrayExt.removeAllWhere(hooks, isNull);
  }

  /**
   * Test whether a value is `null`.
   */
  function isNull<T>(value: T | null): boolean {
    return value === null;
  }
}
