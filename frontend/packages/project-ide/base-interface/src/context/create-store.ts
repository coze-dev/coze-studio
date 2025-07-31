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

import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { type UseBoundStore, type StoreApi } from 'zustand';
import {
  type User,
  type IntelligenceBasicInfo,
  type IntelligencePublishInfo,
} from '@coze-arch/bot-api/intelligence_api';

interface CreateStoreOptions {
  spaceId: string;
  projectId: string;
  version: string;
}

export interface IDEGlobalState {
  /**
   * Project ID
   */
  projectId: string;
  /**
   * Space ID
   */
  spaceId: string;

  version: string;

  /**
   * get_draft_intelligence_info interface returns content
   */
  projectInfo?: {
    ownerInfo?: User;
    projectInfo?: IntelligenceBasicInfo;
    publishInfo?: IntelligencePublishInfo;
  };
}

export interface IDEGlobalAction {
  patch: (next: Partial<IDEGlobalState>) => void;
}

export type StoreContext = UseBoundStore<
  StoreApi<IDEGlobalState & IDEGlobalAction>
>;

export const createStore = (options: CreateStoreOptions) =>
  createWithEqualityFn<IDEGlobalState & IDEGlobalAction>(
    set => ({
      spaceId: options.spaceId,
      projectId: options.projectId,
      version: options.version,
      patch: next => set(() => next),
    }),
    shallow,
  );
