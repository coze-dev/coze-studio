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

import { type Event } from '@flowgram-adapter/common';

import { type URI } from '../common';
export interface LabelChangeEvent {
  affects: (element: object) => boolean;
}

export const LabelHandler = Symbol('LabelHandler');

export interface LabelHandler {
  /**
   * Emit when something has changed that may result in this label provider returning a different
   * value for one or more properties (name, icon etc).
   */
  readonly onChange?: Event<LabelChangeEvent>;
  /**
   * whether this contribution can handle the given element and with what priority.
   * All contributions are ordered by the returned number if greater than zero. The highest number wins.
   * If two or more contributions return the same positive number one of those will be used. It is undefined which one.
   */
  canHandle: (uri: URI) => number;
  /**
   * returns an icon class for the given element.
   */
  getIcon?: (uri: URI) => string | undefined | React.ReactNode;

  /**
   * Custom render label
   */
  renderer?: (uri: URI, opt?: any) => React.ReactNode;

  /**
   * returns a short name for the given element.
   */
  getName?: (uri: URI) => string | undefined;

  /**
   * returns a long name for the given element.
   */
  getDescription?: (uri: URI) => string | undefined;

  /**
   * Check whether the given element is affected by the given change event.
   * Contributions delegating to the label provider can use this hook
   * to perform a recursive check.
   */
  affects?: (uri: URI, event: LabelChangeEvent) => boolean;
}
