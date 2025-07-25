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
   * 触发事件
   * @param event 事件名称
   * @param args 参数
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
   * 订阅事件
   * @param event 事件名称
   * @param fn 事件回调
   */
  on<P extends EventEmitter.EventNames<T>>(
    event: P,
    fn: EventEmitter.EventListener<T, P>,
  ) {
    this.eventEmitter.on(event, fn);
  }

  /**
   * 取消订阅事件
   * @param event 事件名称
   * @param fn 事件回调
   */
  off<P extends EventEmitter.EventNames<T>>(
    event: P,
    fn: EventEmitter.EventListener<T, P>,
  ) {
    this.eventEmitter.off(event, fn);
  }

  /**
   * 开启缓存事件订阅器，开启时会将关闭时收到的事件对应的回调按顺序逐一触发
   */
  start() {
    this.started = true;
    for (const { event, args } of this.buffer) {
      this.emit(event, ...args);
    }
  }

  /**
   * 关闭缓存事件订阅器，在关闭时收到的事件会被缓存并延迟到下次开启时触发
   */
  stop() {
    this.started = false;
  }

  /**
   * 清除缓存事件订阅器缓存的事件，使得在重新开启（start）时不会触发在关闭（stop）时收到的事件对应的回调
   */
  clear() {
    this.buffer = [];
  }
}
