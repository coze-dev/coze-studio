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
