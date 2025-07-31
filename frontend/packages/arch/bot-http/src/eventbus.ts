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

import { GlobalEventBus } from '@coze-arch/web-context';

// API request related events
export enum APIErrorEvent {
  // No login status
  UNAUTHORIZED = 'unauthorized',
  // Logged in, no permission.
  NOACCESS = 'noAccess',
  // Risk control interception
  SHARK_BLOCK = 'sharkBlocked',
  // State restrictions
  COUNTRY_RESTRICTED = 'countryRestricted',
  // Insufficient COZE TOKEN
  COZE_TOKEN_INSUFFICIENT = 'cozeTokenInsufficient',
}

const getEventBus = () => GlobalEventBus.create<APIErrorEvent>('bot-http');

export const emitAPIErrorEvent = (event: APIErrorEvent, ...data: unknown[]) => {
  const evenBus = getEventBus();

  evenBus.emit(event, ...data);
};

export const handleAPIErrorEvent = (
  event: APIErrorEvent,
  fn: (...args: unknown[]) => void,
) => {
  const evenBus = getEventBus();

  evenBus.on(event, fn);
};

export const removeAPIErrorEvent = (
  event: APIErrorEvent,
  fn: (...args: unknown[]) => void,
) => {
  const evenBus = getEventBus();

  evenBus.off(event, fn);
};

export const stopAPIErrorEvent = () => {
  const evenBus = getEventBus();

  evenBus.stop();
};

export const startAPIErrorEvent = () => {
  const evenBus = getEventBus();

  evenBus.start();
};

export const clearAPIErrorEvent = () => {
  const evenBus = getEventBus();

  evenBus.clear();
};
