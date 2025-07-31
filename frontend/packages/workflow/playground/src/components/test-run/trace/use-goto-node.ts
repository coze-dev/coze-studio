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

import { workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { useGlobalState, useScrollToNode } from '@/hooks';

export interface GotoParams {
  nodeId: string;
  workflowId: string;
  executeId: string;
  subExecuteId: string;
}

export const useGotoNode = () => {
  const scrollToNode = useScrollToNode();
  const globalState = useGlobalState();
  const isInProject = !!globalState.projectId;

  const isProjectWorkflow = async (workflowId: string) => {
    try {
      const res = await workflowApi.GetWorkflowDetail(
        {
          space_id: globalState.spaceId,
          workflow_ids: [workflowId],
        },
        { __disableErrorToast: true },
      );

      const info = res?.data?.[0];
      return !!info.project_id;
    } catch {
      return false;
    }
  };

  const gotoLibrary = (params: GotoParams) => {
    const { nodeId, workflowId, executeId, subExecuteId } = params;
    const { spaceId } = globalState;
    const url =
      `/work_flow?space_id=${spaceId}&workflow_id=${workflowId}` +
      `&node_id=${nodeId}&execute_id=${executeId}&sub_execute_id=${subExecuteId}`;

    window.open(url);
  };

  const goto = async (params: GotoParams) => {
    const { nodeId, workflowId, executeId, subExecuteId } = params;
    // The same process, directly focus on the node
    if (workflowId === globalState.workflowId && nodeId) {
      const scrolled = await scrollToNode(nodeId);
      if (!scrolled) {
        Toast.error(I18n.t('workflow_node_has_delete'));
      }
      return;
    }

    // Special jumping logic of operation and maintenance platform
    if (IS_BOT_OP) {
      const searchParams = new URLSearchParams();
      searchParams.append('workflow_id', workflowId);
      searchParams.append('execute_id', executeId);
      searchParams.append('sub_execute_id', subExecuteId);
      searchParams.append('node_id', nodeId);
      window.open(
        `${window.location.pathname}?${searchParams.toString()}`,
        '_blank',
      );
      return;
    }

    // The host process is the resource library process, directly open the new tab of the browser to jump
    if (!isInProject) {
      gotoLibrary(params);
      return;
    }

    const inProject = await isProjectWorkflow(workflowId);
    const projectApi = globalState.getProjectApi();
    if (!inProject || !projectApi) {
      gotoLibrary(params);
      return;
    }
    projectApi.sendMsgOpenWidget(`/workflow/${workflowId}`, {
      name: 'debug',
      data: {
        nodeId,
        executeId,
        subExecuteId,
      },
    });
  };

  return {
    goto,
  };
};
