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
    // 前端先填入回答
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
