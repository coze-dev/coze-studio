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

let eventEmitter: BufferedEventEmitter<EmitEventType> | null = null;

const initEventEmitter = () => {
  if (!eventEmitter) {
    eventEmitter = new BufferedEventEmitter<EmitEventType>();
  }
};

// Module folding, related events
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

// Module pop-ups, related events
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
