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
