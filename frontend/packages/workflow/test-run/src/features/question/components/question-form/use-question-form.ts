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

import { useLayoutEffect } from 'react';

import { useMemoizedFn } from 'ahooks';
import { type NodeEvent } from '@coze-arch/bot-api/workflow_api';

import { type ReceivedMessage } from '../../types';
import { useQuestionFormStore } from '../../hooks';
import { MessageType } from '../../constants';
import { typeSafeJSONParse } from '../../../../utils';
import { useTestRunService } from '../../../../hooks';

export const useQuestionForm = (questionEvent: NodeEvent | undefined) => {
  const testRunService = useTestRunService();
  const { nodeEvent, patch } = useQuestionFormStore(store => ({
    messages: store.messages,
    nodeEvent: store.nodeEvent,
    patch: store.patch,
  }));
  const eventSync = useMemoizedFn((event: NodeEvent | undefined) => {
    // end
    if (!event) {
      testRunService.continueTestRun();
      return;
    }
    patch({ eventId: event.id });
    if (event.node_id !== nodeEvent?.node_id) {
      patch({ nodeEvent: event, messages: [] });
    }

    const { messages: next } = (typeSafeJSONParse(event.data) || []) as {
      messages: ReceivedMessage[];
    };
    if (next.length) {
      patch({ messages: next });
    }
    if (next[next.length - 1].type === MessageType.Question) {
      patch({ waiting: false });
      testRunService.pauseTestRun();
    }
  });

  useLayoutEffect(() => {
    eventSync(questionEvent);
  }, [questionEvent, eventSync]);
};
