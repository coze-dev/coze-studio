import { QuestionForm as QuestionFormCore } from '@coze-workflow/test-run';
import { EventType } from '@coze-arch/bot-api/workflow_api';

import { useExecStateEntity, useGlobalState } from '@/hooks';

export const QuestionForm = () => {
  const { workflowId, spaceId } = useGlobalState();
  const exeState = useExecStateEntity();

  const nodeQuestionEvent = exeState.getNodeEvent(EventType.Question);

  return (
    <QuestionFormCore
      spaceId={spaceId}
      workflowId={workflowId}
      executeId={exeState.config.executeId}
      questionEvent={nodeQuestionEvent}
    />
  );
};
