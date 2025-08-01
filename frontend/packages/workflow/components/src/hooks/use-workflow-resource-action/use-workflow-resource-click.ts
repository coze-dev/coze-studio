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

  /** Open the process edit page */
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
