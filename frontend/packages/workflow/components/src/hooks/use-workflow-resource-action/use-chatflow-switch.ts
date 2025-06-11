import { workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze/coze-design';
import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';
import { type ResourceInfo } from '@coze-arch/bot-api/plugin_develop';
export const useChatflowSwitch = ({
  spaceId,
  refreshPage,
}: {
  spaceId: string;
  refreshPage?: () => void;
}) => {
  const changeFlowMode = async (flowMode: WorkflowMode, workflowId: string) => {
    await workflowApi.UpdateWorkflowMeta({
      space_id: spaceId,
      workflow_id: workflowId,
      flow_mode: flowMode,
    });
    Toast.success(
      I18n.t('wf_chatflow_123', {
        Chatflow: I18n.t(
          flowMode === WorkflowMode.ChatFlow ? 'wf_chatflow_76' : 'Workflow',
        ),
      }),
    );
    await new Promise(resolve => setTimeout(resolve, 300));
    refreshPage?.();
  };
  const switchToWorkflow = async (record: ResourceInfo) =>
    changeFlowMode(WorkflowMode.Workflow, record.res_id ?? '');
  const switchToChatflow = async (record: ResourceInfo) =>
    changeFlowMode(WorkflowMode.ChatFlow, record.res_id ?? '');
  return { switchToWorkflow, switchToChatflow };
};
