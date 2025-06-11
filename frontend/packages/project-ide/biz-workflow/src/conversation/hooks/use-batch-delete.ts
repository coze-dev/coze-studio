import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze/coze-design';
import {
  CreateEnv,
  type ProjectConversation,
} from '@coze-arch/bot-api/workflow_api';
import { workflowApi } from '@coze-arch/bot-api';
import { useIDEGlobalStore } from '@coze-project-ide/framework';

interface UseBatchDeleteOptions {
  connectorId: string;
  createEnv: CreateEnv;
  manualRefresh: () => void;
  setActivateChat: (_chat: ProjectConversation | undefined) => void;
}

export const useBatchDelete = (options: UseBatchDeleteOptions) => {
  const { spaceId, projectId } = useIDEGlobalStore(store => ({
    spaceId: store.spaceId,
    projectId: store.projectId,
  }));

  const batchDelete = async (ids: string[]) => {
    const isDraft = options.createEnv === CreateEnv.Draft;
    const res = await workflowApi.BatchDeleteProjectConversation({
      space_id: spaceId,
      project_id: projectId,
      unique_id_list: ids,
      draft_mode: isDraft,
      connector_id: isDraft ? '' : options.connectorId,
    });
    if (res.Success) {
      Toast.success(I18n.t('wf_chatflow_112'));
      options.manualRefresh();
      options.setActivateChat(undefined);
    } else {
      Toast.error(I18n.t('wf_chatflow_151'));
    }
  };

  return {
    batchDelete,
  };
};
