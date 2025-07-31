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
import { type NodeEvent } from '@coze-arch/bot-api/workflow_api';

import { type ReceivedMessage } from '../types';

export interface QuestionFormState {
  /**
   * common value
   */
  spaceId: string;
  workflowId: string;
  executeId: string;

  /**
   * inner value
   */
  messages: ReceivedMessage[];
  waiting: boolean;
  nodeEvent: NodeEvent | null;
  eventId: string;
}

export interface QuestionFormAction {
  /** update status */
  patch: (next: Partial<QuestionFormState>) => void;
}

export interface CreateStoreOptions {
  spaceId: string;
  workflowId: string;
  executeId: string;
}

export const createQuestionFormStore = (options: CreateStoreOptions) =>
  createWithEqualityFn<QuestionFormState & QuestionFormAction>(
    set => ({
      ...options,
      messages: [],
      waiting: false,
      nodeEvent: null,
      eventId: '',
      patch: next => set(() => next),
    }),
    shallow,
  );
