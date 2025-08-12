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

import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { I18n } from '@coze-arch/i18n';
import { SceneType, usePageJumpService } from '@coze-arch/bot-hooks';
import {
  type Knowledge,
  type GetDraftBotInfoAgwData,
  type KnowledgeInfo,
  ReferenceUpdateType,
  BotMode,
} from '@coze-arch/bot-api/playground_api';
import {
  type Dataset,
  DatasetStatus,
  StorageLocation,
} from '@coze-arch/bot-api/knowledge';
import { PlaygroundApi } from '@coze-arch/bot-api';
import { Toast, Button } from '@coze-arch/coze-design';

import { ActionType } from '@/types';

type BotDataset =
  | Knowledge
  | {
      dataset: KnowledgeInfo[];
    };

interface UpdateDatasetForBot {
  botId: string;
  agentId: string;
  dataset: BotDataset;
  updatedDatasetList?: KnowledgeInfo[];
  spaceId: string;

  dataSetDetail?: Dataset;
}
export const useFetchBotInfo = (spaceId, botId) => {
  const [botInfo, setBotInfo] = useState<GetDraftBotInfoAgwData>();
  const fetchBotInfo = async () => {
    try {
      const { data } = await PlaygroundApi.GetDraftBotInfoAgw({
        bot_id: botId,
      });
      setBotInfo(data ?? {});
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (spaceId && botId) {
      fetchBotInfo();
    }
  }, [spaceId, botId]);

  return botInfo;
};

const updateDatasetForBot = async ({
  botId,
  agentId,
  dataset,
  botInfo,
  updatedDatasetList,
  spaceId,
}: UpdateDatasetForBot & {
  botInfo?: GetDraftBotInfoAgwData;
}) => {
  if (botInfo?.bot_info.bot_mode === BotMode.SingleMode) {
    await PlaygroundApi.UpdateDraftBotInfoAgw({
      bot_info: {
        bot_id: botId,
        knowledge: {
          ...dataset,
          knowledge_info: updatedDatasetList,
        },
      },
    });
  } else {
    const currentAgent = botInfo?.bot_info?.agents?.find(
      agent => agent.agent_id === agentId,
    );
    if (currentAgent?.agent_id) {
      await PlaygroundApi.UpdateAgentV2({
        ...currentAgent,
        current_version:
          currentAgent.update_type === ReferenceUpdateType.AutoUpdate
            ? '0'
            : currentAgent.current_version,
        id: currentAgent?.agent_id,
        space_id: spaceId,
        bot_id: botId,
        knowledge: {
          ...dataset,
          knowledge_info: updatedDatasetList,
        },
      });
    }
  }
};

export const getUpdatedDataset = (
  dataset: BotDataset,
  actionType: ActionType,
  dataSetDetail: Dataset,
): KnowledgeInfo[] => {
  // Updated bot knowledge base
  let updatedDatasetList: KnowledgeInfo[] = [];
  // The original bot knowledge base content
  let originDataset: KnowledgeInfo[] = [];

  // Compatible with the json version of dataset, delete it after FG is full
  if ('dataset' in dataset) {
    originDataset = dataset?.dataset ?? [];
  } else {
    originDataset = dataset?.knowledge_info ?? [];
  }

  if (actionType === ActionType.REMOVE) {
    updatedDatasetList = originDataset?.filter(
      item => item.id !== dataSetDetail.dataset_id,
    );
  } else {
    updatedDatasetList = [
      ...originDataset,
      { name: dataSetDetail.name, id: dataSetDetail.dataset_id },
    ];
  }

  return updatedDatasetList;
};

// Update bot knowledge base logic
export const handleDatasetUpdate = async ({
  botInfo,
  botId,
  agentId,
  dataSetDetail = {},
  dataset,
  actionType,
  spaceId,
  updateSuccess,
}: UpdateDatasetForBot & {
  botInfo?: GetDraftBotInfoAgwData;
  updateSuccess: () => void;
  actionType: ActionType;
}) => {
  const updatedDatasetList = getUpdatedDataset(
    dataset,
    actionType,
    dataSetDetail,
  );

  const updateBotParams = {
    spaceId,
    botId,
    agentId,
    updatedDatasetList,
    dataset,
  };

  await updateDatasetForBot({ ...updateBotParams, botInfo });

  updateSuccess();
};

// Get the original dataset of different bots according to different botInfo information
export const getDatasetInfo = (
  botInfo: GetDraftBotInfoAgwData | undefined,
  agentId: string,
): BotDataset => {
  if (agentId) {
    return (
      botInfo?.bot_info?.agents?.find(item => item.agent_id === agentId)
        ?.knowledge ?? {}
    );
  }

  return botInfo?.bot_info?.knowledge ?? {};
};

export const NavBarActionButton = ({
  dataSetDetail,
}: {
  dataSetDetail: Dataset;
}) => {
  const [loading, setLoading] = useState(false);
  const { jump } = usePageJumpService();
  const params = useKnowledgeParams();
  const { spaceID, botID, agentID, actionType } = params;

  const botInfo = useFetchBotInfo(spaceID, botID);

  const dataset = getDatasetInfo(botInfo, agentID ?? '');

  const updateSuccess = () => {
    Toast.success(
      I18n.t(
        actionType === ActionType.REMOVE
          ? 'bot_edit_dataset_removed_toast'
          : 'bot_edit_dataset_added_toast',
        { dataset_name: dataSetDetail.name },
      ),
    );
    jump(SceneType.KNOWLEDGE__BACK__BOT, {
      spaceID,
      botID,
      mode:
        dataSetDetail.storage_location === StorageLocation.Douyin
          ? 'douyin'
          : 'bot',
    });
  };
  const handleActionClick = async () => {
    setLoading(true);
    try {
      await handleDatasetUpdate({
        botInfo,
        botId: botID ?? '',
        agentId: agentID ?? '',
        dataSetDetail,
        dataset,
        actionType: actionType ?? ActionType.ADD,
        spaceId: spaceID ?? '',
        updateSuccess,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      loading={loading}
      disabled={dataSetDetail?.status === DatasetStatus.DatasetForbid}
      onClick={handleActionClick}
    >
      {actionType === ActionType.REMOVE &&
      dataSetDetail?.storage_location === StorageLocation.Douyin
        ? I18n.t('dy_avatar_resource_delete')
        : null}
      {actionType === ActionType.REMOVE &&
      dataSetDetail?.storage_location !== StorageLocation.Douyin
        ? I18n.t('kl2_014')
        : null}
      {actionType !== ActionType.REMOVE &&
      dataSetDetail?.storage_location === StorageLocation.Douyin
        ? I18n.t('dy_avatar_resource_add')
        : null}
      {actionType !== ActionType.REMOVE &&
      dataSetDetail?.storage_location !== StorageLocation.Douyin
        ? I18n.t('kl2_013')
        : null}
    </Button>
  );
};
