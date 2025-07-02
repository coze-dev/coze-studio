import { useRequest } from 'ahooks';
import { type CheckType, WorkflowMode } from '@coze-arch/idl/workflow_api';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { workflowApi } from '@coze-arch/bot-api';
import { useParams } from 'react-router-dom';

export interface ChatflowOptionProps {
  value: string;
  label: string;
  disabled?: boolean;
  tooltip?: string;
}

export function useChatflowOptions(checkType?: CheckType) {
  const needsCheck = typeof checkType !== 'undefined';
  const { space_id = '', project_id = '' } = useParams<DynamicParams>();
  const { data: chatflowOptions, loading } = useRequest(async () => {
    const res = await workflowApi.GetWorkFlowList({
      space_id,
      project_id,
      flow_mode: WorkflowMode.ChatFlow,
      page: 1,
      size: 100,
      checker: needsCheck ? [checkType] : undefined,
    });
    return res.data.workflow_list?.map(item => ({
      label: item.name,
      value: item.workflow_id,
      disabled: needsCheck
        ? item.check_result?.find(r => r.type === checkType)?.is_pass !== true
        : false,
      tooltip: item.check_result?.find(r => r.type === checkType)?.reason,
    })) as ChatflowOptionProps[];
  });
  return { chatflowOptions, loading };
}
