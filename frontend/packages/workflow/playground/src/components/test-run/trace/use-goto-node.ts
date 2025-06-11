import { workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze/coze-design';

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
    // 同一个流程，直接 focus 节点即可
    if (workflowId === globalState.workflowId && nodeId) {
      const scrolled = await scrollToNode(nodeId);
      if (!scrolled) {
        Toast.error(I18n.t('workflow_node_has_delete'));
      }
      return;
    }

    // 运维平台特殊跳转逻辑
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

    // 宿主流程为资源库流程，直接打开浏览器新 tab 跳转
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
