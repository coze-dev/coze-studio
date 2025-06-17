import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { workflowApi } from '@coze-arch/bot-api';
import { useIDEGlobalStore } from '@coze-project-ide/framework';

export const useCreateChat = ({
  manualRefresh,
}: {
  manualRefresh: () => void;
}) => {
  const { spaceId, projectId } = useIDEGlobalStore(store => ({
    spaceId: store.spaceId,
    projectId: store.projectId,
  }));
  const [loading, setLoading] = useState(false);
  const handleCreateChat = async (input: string) => {
    try {
      setLoading(true);
      const res = await workflowApi.CreateProjectConversationDef({
        space_id: spaceId,
        project_id: projectId,
        conversation_name: input,
      });
      if (res?.code === 0) {
        Toast.success(I18n.t('wf_chatflow_111'));
        manualRefresh();
      } else {
        Toast.error(I18n.t('wf_chatflow_112'));
      }
    } finally {
      setLoading(false);
    }
  };
  return { loading, handleCreateChat };
};
