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
import { type AbilityKey } from '@coze-agent-ide/tool-config';

interface EventWithData<T extends EventEmitter.ValidEventTypes> {
  event: EventEmitter.EventNames<T>;
  args: Parameters<EventEmitter.EventListener<T, EventEmitter.EventNames<T>>>;
}

export class BufferedEventEmitter<T extends EventEmitter.ValidEventTypes> {
  eventEmitter = new EventEmitter<T>();

  started = true;

  buffer: EventWithData<T>[] = [];

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

let eventEmitter: BufferedEventEmitter<EmitEventType> | null = null;

const initEventEmitter = () => {
  if (!eventEmitter) {
    eventEmitter = new BufferedEventEmitter<EmitEventType>();
  }
};

// 模块折叠 有关事件
export enum OpenBlockEvent {
  DATA_MEMORY_BLOCK_OPEN = 'dataMemoryBlockOpen',
  TABLE_MEMORY_BLOCK_OPEN = 'tableMemoryBlockOpen',
  DATA_SET_BLOCK_OPEN = 'dataSetBlockOpen',
  TIME_CAPSULE_BLOCK_OPEN = 'timeCapsuleBlockOpen',
  ONBORDING_MESSAGE_BLOCK_OPEN = 'onbordingMessageBlockOpen',
  PLUGIN_API_BLOCK_OPEN = 'pluginApiBlockOpen',
  WORKFLOW_BLOCK_OPEN = 'workflowBlockOpen',
  IMAGEFLOW_BLOCK_OPEN = 'imageBlockOpen',
  TASK_MANAGE_OPEN = 'taskManageOpen',
  SUGGESTION_BLOCK_OPEN = 'suggestionBlockOpen',
  TTS_BLOCK_OPEN = 'TTSBlockOpen',
  FILEBOX_OPEN = 'FileboxOpen',
  BACKGROUND_IMAGE_BLOCK = 'BackgroundImageOpen',
}

// 模块弹窗 有关事件
export enum OpenModalEvent {
  PLUGIN_API_MODAL_OPEN = 'pluginApiModalOpen',
}

export type EmitEventType = OpenBlockEvent | OpenModalEvent | AbilityKey;
export const emitEvent = (event: EmitEventType, ...data: unknown[]) => {
  initEventEmitter();

  eventEmitter?.emit(event, ...data);
};

export const handleEvent = (
  event: EmitEventType,
  fn: (...args: unknown[]) => void,
) => {
  initEventEmitter();

  eventEmitter?.on(event, fn);
};

export const removeEvent = (
  event: EmitEventType,
  fn: (...args: unknown[]) => void,
) => {
  initEventEmitter();

  eventEmitter?.off(event, fn);
};

export enum DraftEvent {
  DELETE_VARIABLE = 'deleteVariable',
}

export const draftEventEmitter = new EventEmitter();
