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
  /** 更新状态 */
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
