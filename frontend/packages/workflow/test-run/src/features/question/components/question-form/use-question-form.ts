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
    // 结束
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
