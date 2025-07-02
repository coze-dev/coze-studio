import { useEffect, useState } from 'react';

import {
  workflowApi,
  type WorkflowMode,
  type Workflow,
} from '@coze-workflow/base/api';

export const useWorkflowTemplateList = ({
  spaceId,
  flowMode,
  isInitWorkflow,
}: {
  spaceId: string;
  flowMode: WorkflowMode;
  isInitWorkflow?: boolean;
}): {
  workflowTemplateList: Workflow[];
} => {
  const [workflowTemplateList, setWorkflowList] = useState<Workflow[]>([]);

  const getWorkflowProductList = async () => {
    const workflowProductList = await workflowApi.GetExampleWorkFlowList({
      page: 1,
      size: 20,
      name: '',
      flow_mode: flowMode,
    });

    setWorkflowList(workflowProductList?.data?.workflow_list ?? []);
  };
  useEffect(() => {
    if (!isInitWorkflow) {
      return;
    }

    getWorkflowProductList();
  }, [spaceId, isInitWorkflow]);

  return {
    workflowTemplateList,
  };
};
