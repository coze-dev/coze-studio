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

import { type Disposable } from '@flowgram-adapter/common';

export const EventService = Symbol('EventService');

export type EventName = string;

export type SupportEvent =
  | MouseEvent
  | DragEvent
  | KeyboardEvent
  | UIEvent
  | TouchEvent
  | any;
export type EventHandler = (event: SupportEvent) => boolean | undefined | void;

export interface EventRegsiter {
  handle: EventHandler;
  priority: number;
}

export interface EventService {
  /**
   * Monitor global events
   * @Param name The name of the event fired
   * @Param handles execution after triggering event
   * @param priority priority
   */
  listenGlobalEvent: (
    name: EventName,
    handle: EventHandler,
    priority?: number,
  ) => Disposable;
}

export const EventContribution = Symbol('EventContribution');

export interface EventContribution {
  /**
   * Register for events
   */
  registerEvent: (service: EventService) => void;
}
