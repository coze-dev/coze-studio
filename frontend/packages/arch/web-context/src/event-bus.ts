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

import EventEmitter from 'eventemitter3';

interface EventWithData<T extends EventEmitter.ValidEventTypes> {
  event: EventEmitter.EventNames<T>;
  args: Parameters<EventEmitter.EventListener<T, EventEmitter.EventNames<T>>>;
}

type ValidEventTypes = EventEmitter.ValidEventTypes;

export class GlobalEventBus<T extends ValidEventTypes> {
  private eventEmitter = new EventEmitter<T>();

  private started = true;

  private buffer: EventWithData<T>[] = [];

  private static instances = new Map<string, GlobalEventBus<ValidEventTypes>>();

  static create<T extends ValidEventTypes>(key: string): GlobalEventBus<T> {
    if (GlobalEventBus.instances.has(key)) {
      return GlobalEventBus.instances.get(key) as unknown as GlobalEventBus<T>;
    }
    const instance = new GlobalEventBus<T>();
    GlobalEventBus.instances.set(
      key,
      instance as unknown as GlobalEventBus<ValidEventTypes>,
    );
    return instance;
  }

  /**
   * trigger event
   * @param event name
   * @param args parameter
   */
  emit<P extends EventEmitter.EventNames<T>>(
    event: P,
    ...args: Parameters<EventEmitter.EventListener<T, P>>
  ) {
    if (!this.started) {
      this.buffer.push({
        event,
        args,
      });
      return;
    }
    this.eventEmitter.emit(event, ...args);
  }

  /**
   * subscribe to events
   * @param event name
   * @param fn event callback
   */
  on<P extends EventEmitter.EventNames<T>>(
    event: P,
    fn: EventEmitter.EventListener<T, P>,
  ) {
    this.eventEmitter.on(event, fn);
  }

  /**
   * unsubscribe from the event
   * @param event name
   * @param fn event callback
   */
  off<P extends EventEmitter.EventNames<T>>(
    event: P,
    fn: EventEmitter.EventListener<T, P>,
  ) {
    this.eventEmitter.off(event, fn);
  }

  /**
   * Turn on the cached event subscriber, and when turned on, the callbacks corresponding to the events received when closed will be fired one by one in sequence
   */
  start() {
    this.started = true;
    for (const { event, args } of this.buffer) {
      this.emit(event, ...args);
    }
  }

  /**
   * Close the cached event subscriber. Events received during shutdown will be cached and delayed until the next time it is turned on
   */
  stop() {
    this.started = false;
  }

  /**
   * Clears the cached events of the event subscriber so that the callback corresponding to the event received at stop is not triggered when starting again
   */
  clear() {
    this.buffer = [];
  }
}
