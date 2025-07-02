import type { ResourceInfo } from '@coze-arch/bot-api/plugin_develop';
import { useNavigate } from 'react-router-dom';

import { reporter } from '@/utils';

export const useWorkflowResourceClick = (spaceId?: string) => {
  const navigate = useNavigate();

  const onEditWorkFlow = (workflowId?: string) => {
    reporter.info({
      message: 'workflow_list_edit_row',
      meta: {
        workflowId,
      },
    });
    goWorkflowDetail(workflowId, spaceId);
  };

  /** 打开流程编辑页 */
  const goWorkflowDetail = (workflowId?: string, sId?: string) => {
    if (!workflowId || !sId) {
      return;
    }
    reporter.info({
      message: 'workflow_list_navigate_to_detail',
      meta: {
        workflowId,
      },
    });

    navigate(`/work_flow?workflow_id=${workflowId}&space_id=${sId}`);
  };
  const handleWorkflowResourceClick = (record: ResourceInfo) => {
    reporter.info({
      message: 'workflow_list_click_row',
    });
    onEditWorkFlow(record?.res_id);
  };

  return { handleWorkflowResourceClick, goWorkflowDetail };
};
