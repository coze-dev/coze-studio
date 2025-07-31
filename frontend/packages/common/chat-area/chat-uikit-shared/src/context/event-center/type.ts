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

import { type RefObject } from 'react';

import { type Emitter } from 'mitt';

export enum UIKitEvents {
  WINDOW_RESIZE,
  AFTER_CARD_RENDER,
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- mitt's type does not recognize interface
export type UIKitEventMap = {
  [UIKitEvents.WINDOW_RESIZE]: undefined;
  [UIKitEvents.AFTER_CARD_RENDER]: { messageId: string };
};

export type UIKitEventCenter = Emitter<UIKitEventMap>;

export interface UIKitEventProviderProps {
  chatContainerRef: RefObject<HTMLDivElement>;
}
