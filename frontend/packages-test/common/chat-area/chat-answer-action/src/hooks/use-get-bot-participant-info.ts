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
