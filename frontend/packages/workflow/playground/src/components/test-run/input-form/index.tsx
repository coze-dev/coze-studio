import { InputForm as InputFormCore } from '@coze-workflow/test-run/input';
import { EventType } from '@coze-arch/bot-api/workflow_api';

import { useExecStateEntity, useGlobalState } from '@/hooks';

export const InputForm = () => {
  const { workflowId, spaceId } = useGlobalState();
  const exeState = useExecStateEntity();
  const nodeInputEvent = exeState.getNodeEvent(EventType.InputNode);

  return (
    <InputFormCore
      spaceId={spaceId}
      workflowId={workflowId}
      executeId={exeState.config.executeId}
      inputEvent={nodeInputEvent}
    />
  );
};
