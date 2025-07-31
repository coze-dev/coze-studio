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

import { useRequest } from 'ahooks';
import { type GetBotParticipantInfoByBotIdsResponse } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

import { type BotParticipantInfoWithId } from '../store/favorite-bot-trigger-config';
import { useAnswerActionStore } from '../context/store';

export const useGetBotParticipantInfo = ({
  botId,
  isEnabled,
}: {
  botId: string | undefined;
  isEnabled: boolean;
}) => {
  const { useFavoriteBotTriggerConfigStore } = useAnswerActionStore();

  useRequest(
    (): Promise<GetBotParticipantInfoByBotIdsResponse | undefined> => {
      if (!botId) {
        return Promise.resolve(undefined);
      }
      return DeveloperApi.GetBotParticipantInfoByBotIds({
        bot_ids: [botId],
      });
    },
    {
      ready: isEnabled && Boolean(botId),
      refreshDeps: [isEnabled, botId],
      onSuccess: res => {
        if (!res) {
          return;
        }

        const { updateMapByConfigList } =
          useFavoriteBotTriggerConfigStore.getState();

        const participantInfoList: BotParticipantInfoWithId[] = Object.entries(
          res.participant_info_map ?? {},
        ).map(([participantBotId, item]) => ({
          ...item,
          botId: participantBotId,
        }));

        updateMapByConfigList(participantInfoList);
      },
    },
  );
};
