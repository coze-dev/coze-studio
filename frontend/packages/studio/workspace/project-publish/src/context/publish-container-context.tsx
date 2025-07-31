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

import { createContext, type RefObject, useContext } from 'react';

export interface PublishContainerContextProps {
  getContainerRef: () => RefObject<HTMLDivElement> | null;
  /** The layout of the distribution channel is influenced by the height of the top header. Use this variable to associate them */
  publishHeaderHeight: number;
  setPublishHeaderHeight: (height: number) => void;
}

export const PublishContainerContext =
  createContext<PublishContainerContextProps>({
    getContainerRef: () => null,
    publishHeaderHeight: 0,
    setPublishHeaderHeight: () => 0,
  });

export const usePublishContainer = () => useContext(PublishContainerContext);
