import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

import { useGlobalState } from '@/hooks';

export default function useSendTea() {
  const { spaceId, projectId, workflowId } = useGlobalState();

  const handleSendTea = (
    action: string,
    info?: { id: string; category: string },
  ) => {
    sendTeaEvent(EVENT_NAMES.prompt_library_front, {
      source: projectId ? 'app_detail_page' : 'resource_library',
      prompt_id: info?.id || '',
      prompt_type:
        info?.category === 'Recommended' ? 'recommended' : 'workspace',
      action,
      space_id: spaceId,
      project_id: projectId,
      workflow_id: workflowId,
    });
  };

  return {
    handleSendTea,
  };
}
