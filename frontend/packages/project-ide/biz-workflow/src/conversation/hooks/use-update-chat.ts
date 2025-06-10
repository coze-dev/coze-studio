import { useState } from 'react';

import { workflowApi } from '@coze-arch/bot-api';
import { useIDEGlobalStore } from '@coze-project-ide/framework';

export const useUpdateChat = ({
  manualRefresh,
}: {
  manualRefresh: () => void;
}) => {
  const { spaceId, projectId } = useIDEGlobalStore(store => ({
    spaceId: store.spaceId,
    projectId: store.projectId,
  }));
  const [loading, setLoading] = useState(false);
  const handleUpdateChat = async (
    uniqueId: string,
    conversationName: string,
  ) => {
    try {
      setLoading(true);
      await workflowApi.UpdateProjectConversationDef({
        space_id: spaceId,
        project_id: projectId,
        unique_id: uniqueId,
        conversation_name: conversationName,
      });
      manualRefresh();
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleUpdateChat };
};
