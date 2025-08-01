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

import { useEffect } from 'react';

import mitt from 'mitt';
import type { Emitter, Handler, EventType } from 'mitt';

import { type Chunk } from '../types/chunk';

// Define event name literal type
export type EventTypeName =
  | 'previewContextMenuItemAction'
  | 'hoverEditBarAction';

/**
 * event type definition
 */
export interface EventTypes extends Record<EventType, unknown> {
  // right-click menu related events
  previewContextMenuItemAction: {
    type: 'add-after' | 'add-before' | 'delete' | 'edit';
    targetChunk: Chunk;
    newChunk?: Chunk;
    chunks?: Chunk[];
  };

  // Floating edit bar related events
  hoverEditBarAction: {
    type: 'add-after' | 'add-before' | 'delete' | 'edit';
    targetChunk: Chunk;
    newChunk?: Chunk;
    chunks?: Chunk[];
  };
}

/**
 * event handler type
 */
export type EventHandler<T extends EventTypeName> = Handler<EventTypes[T]>;

/**
 * Create an event bus instance
 */
export const createEventBus = (): Emitter<EventTypes> => mitt<EventTypes>();

/**
 * Global Event Bus instance
 */
export const eventBus = createEventBus();

/**
 * event bus hook
 * Used to use the event bus in components
 */
export const useEventBus = () => eventBus;

/**
 * listen event hook
 * Used to listen for events in a component
 * @param eventName
 * @param handler event handler
 * @Param deps dependency arrays, rebind events when dependencies change
 */
export const useEventListener = <T extends EventTypeName>(
  eventName: T,
  handler: EventHandler<T>,
  deps: React.DependencyList = [],
) => {
  useEffect(() => {
    // binding event
    eventBus.on(eventName, handler as Handler<unknown>);

    // Unbind event when component is unmounted
    return () => {
      eventBus.off(eventName, handler as Handler<unknown>);
    };
  }, deps);
};
