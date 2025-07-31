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

import { nanoid } from 'nanoid';
import { useMemoizedFn } from 'ahooks';
import { workflowApi } from '@coze-workflow/base/api';

import { type ReceivedMessage } from '../types';
import { useQuestionFormStore } from '../hooks/use-question-form-store';
import { MessageType, ContentType } from '../constants';
import { useTestRunService } from '../../../hooks';

export const useSendMessage = () => {
  const { spaceId, workflowId, executeId, messages, eventId, waiting, patch } =
    useQuestionFormStore(store => ({
      spaceId: store.spaceId,
      workflowId: store.workflowId,
      executeId: store.executeId,
      messages: store.messages,
      eventId: store.eventId,
      waiting: store.waiting,
      patch: store.patch,
    }));
  const testRunService = useTestRunService();

  const send = useMemoizedFn(async (text: string) => {
    // Fill in the answer first
    const temp: ReceivedMessage = {
      content: text,
      type: MessageType.Answer,
      content_type: ContentType.Text,
      id: nanoid(),
    };
    const next = messages.concat([temp]);
    patch({ waiting: true, messages: next });

    try {
      await workflowApi.WorkFlowTestResume({
        workflow_id: workflowId,
        space_id: spaceId,
        data: text,
        event_id: eventId,
        execute_id: executeId,
      });
    } finally {
      testRunService.continueTestRun();
    }
  });

  return { send, waiting };
};
