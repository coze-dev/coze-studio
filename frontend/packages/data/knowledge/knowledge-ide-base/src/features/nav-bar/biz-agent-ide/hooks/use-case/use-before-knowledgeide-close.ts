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

import { useMemo, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  useKnowledgeParams,
  useKnowledgeStore,
} from '@coze-data/knowledge-stores';
import { I18n } from '@coze-arch/i18n';
import { SceneType, usePageJumpService } from '@coze-arch/bot-hooks';
import { StorageLocation } from '@coze-arch/bot-api/knowledge';
import { Modal, Toast } from '@coze-arch/coze-design';

import { ActionType } from '@/types';
import {
  useFetchBotInfo,
  getDatasetInfo,
  handleDatasetUpdate,
} from '@/features/nav-bar-action-button';

export const useBeforeKnowledgeIDEClose = ({
  onBack,
}: {
  onBack?: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const {
    spaceID: spaceId,
    agentID: agentId,
    botID: botId,
    actionType,
  } = useKnowledgeParams();
  const { dataSetDetail } = useKnowledgeStore(
    useShallow(state => ({
      dataSetDetail: state.dataSetDetail,
    })),
  );

  const { jump } = usePageJumpService();

  const botInfo = useFetchBotInfo(spaceId, botId);

  const dataset = getDatasetInfo(botInfo, agentId ?? '');

  const hasAddDataset = useMemo(() => {
    let datasetIds: string[] = [];
    if ('dataset' in dataset) {
      datasetIds = (dataset?.dataset || []).map(item => item.id ?? '');
    }
    if ('knowledge_info' in dataset) {
      datasetIds = (dataset?.knowledge_info || []).map(item => item.id ?? '');
    }
    return !datasetIds.includes(dataSetDetail?.dataset_id || '');
  }, [dataset, dataSetDetail?.dataset_id]);

  const updateSuccessJump = () => {
    jump(SceneType.KNOWLEDGE__BACK__BOT, {
      spaceID: spaceId,
      botID: botId,
      mode:
        dataSetDetail?.storage_location === StorageLocation.Douyin
          ? 'douyin'
          : 'bot',
    });
  };
  const handleFullModalBack = () => {
    if (onBack) {
      onBack?.();
    } else {
      updateSuccessJump();
    }
  };

  const updateSuccess = () => {
    Toast.success(
      I18n.t(
        actionType === ActionType.REMOVE
          ? 'bot_edit_dataset_removed_toast'
          : 'bot_edit_dataset_added_toast',
        { dataset_name: dataSetDetail?.name },
      ),
    );
    updateSuccessJump();
  };

  const handleBotIdeBack = () => {
    // Bot IDE checks whether there is binding knowledge. If there is binding knowledge base, it will be closed normally, and there is no binding confirmation prompt.
    if (hasAddDataset) {
      Modal.confirm({
        title: I18n.t('bot_ide_knowledge_confirm_title'),
        content:
          dataSetDetail?.storage_location === StorageLocation.Douyin
            ? I18n.t('dy_avatar_resource_add_tip')
            : I18n.t('bot_ide_knowledge_confirm_content'),
        okText: I18n.t('bot_ide_knowledge_confirm_ok'),
        cancelText: I18n.t('bot_ide_knowledge_confirm_cancel'),
        confirmLoading: loading,
        onOk: async () => {
          setLoading(true);
          try {
            await handleDatasetUpdate({
              botInfo,
              botId: botId ?? '',
              agentId: agentId ?? '',
              dataSetDetail,
              dataset,
              actionType: actionType ?? ActionType.ADD,
              spaceId: spaceId ?? '',
              updateSuccess,
            });
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
            // Jump once regardless of success
            handleFullModalBack();
          }
        },
        onCancel: () => {
          // Cancel, jump normally
          handleFullModalBack();
        },
      });
    } else {
      // Normal binding does not do pop-up interception
      handleFullModalBack();
    }
  };

  return handleBotIdeBack;
};
