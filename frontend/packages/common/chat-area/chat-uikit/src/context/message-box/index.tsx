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

import { createContext, useContext } from 'react';

import {
  type Layout,
  type IEventCallbacks,
} from '@coze-common/chat-uikit-shared';

export interface UIKitMessageBoxContextProps {
  imageAutoSizeContainerWidth?: number;
  layout?: Layout;
  enableImageAutoSize?: boolean;
  eventCallbacks?: IEventCallbacks;
  onError?: (error: unknown) => void;
}

export const UIKitMessageBoxContext =
  createContext<UIKitMessageBoxContextProps>({});

export const UIKitMessageBoxProvider = UIKitMessageBoxContext.Provider;

export const useUiKitMessageBoxContext = () =>
  useContext(UIKitMessageBoxContext);
