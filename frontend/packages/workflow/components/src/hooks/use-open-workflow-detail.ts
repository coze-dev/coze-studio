import type { DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { useParams } from 'react-router-dom';

export const useOpenWorkflowDetail = () => {
  const { bot_id: botId } = useParams<DynamicParams>();

  /** 打开流程详情页 */
  const openWorkflowDetailPage = ({
    workflowId,
    spaceId,
    projectId,
    ideNavigate,
  }: {
    workflowId: string;
    spaceId: string;
    projectId?: string;
    ideNavigate?: (uri: string) => void;
  }) => {
    if (projectId && ideNavigate) {
      ideNavigate(`/workflow/${workflowId}?from=createSuccess`);
    } else {
      const query = new URLSearchParams();
      botId && query.append('bot_id', botId);
      query.append('space_id', spaceId ?? '');
      query.append('workflow_id', workflowId);
      query.append('from', 'createSuccess');
      window.open(`/work_flow?${query.toString()}`, '_blank');
    }
  };
  return openWorkflowDetailPage;
};
