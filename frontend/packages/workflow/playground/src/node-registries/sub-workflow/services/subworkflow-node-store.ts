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

import { type SubWorkflowDetailDTO, type Identifier } from '../types';

interface SubWorkflowNodeServiceState {
  loading: boolean;

  /**
   * Sub-process node data, key is the unique identifier of the specific tool of the sub-process, and value is the sub-process node data
   */
  data: Record<string, SubWorkflowDetailDTO>;

  /**
   * The sub-process node data loads the error message, the key is the unique identifier of the specific tool of the sub-process, and the value is the error message.
   */
  error: Record<string, string | undefined>;
}

interface SubWorkflowNodeServiceAction {
  getData: (identifier: Identifier) => SubWorkflowDetailDTO;
  setData: (identifier: Identifier, value: SubWorkflowDetailDTO) => void;
  getError: (identifier: Identifier) => string | undefined;
  setError: (identifier: Identifier, value: string | undefined) => void;
  clearError: (identifier: Identifier) => void;
}

export function getCacheKey(identifier: Identifier): string {
  return `${identifier.workflowId}_${identifier.workflowVersion}`;
}

export type SubWorkflowNodeStore = SubWorkflowNodeServiceState &
  SubWorkflowNodeServiceAction;

export const createStore = () =>
  createWithEqualityFn<SubWorkflowNodeStore>(
    (set, get) => ({
      loading: false,
      data: {},
      error: {},

      getData(identifier) {
        const key = getCacheKey(identifier);
        return get().data[key];
      },

      setData(identifier, value) {
        const key = getCacheKey(identifier);
        set({
          data: {
            ...get().data,
            [key]: value,
          },
        });
      },

      getError(identifier) {
        const key = getCacheKey(identifier);
        return get().error[key];
      },

      setError(identifier, value) {
        const key = getCacheKey(identifier);
        set({
          error: {
            ...get().error,
            [key]: value,
          },
        });
      },

      clearError(identifier) {
        const key = getCacheKey(identifier);
        set({
          error: {
            ...get().error,
            [key]: undefined,
          },
        });
      },
    }),
    shallow,
  );
