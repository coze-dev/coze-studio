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

import { useQuery } from '@tanstack/react-query';
import { Scene } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

import { transformBotInfo, useBotInfo } from './use-bot-info';

const MAX_ROUND_COUNT = 20;
const getMessageList = async ({
  botId,
  botCount,
}: {
  botId: string;
  botCount: number;
}) => {
  const totalRound = Math.ceil(botCount / MAX_ROUND_COUNT);

  let cursor = '0';
  let round = 0;

  let messageList: { role: string; content: string }[] = [];
  while (round < totalRound) {
    const res = await DeveloperApi.GetMessageList({
      bot_id: botId,
      draft_mode: true,
      scene: Scene.Playground,

      cursor,
      count: Math.min(botCount - round * MAX_ROUND_COUNT, MAX_ROUND_COUNT),
    });

    messageList = [
      ...messageList,
      ...res.message_list
        .filter(item => item.type === 'question' || item.type === 'answer')
        .map(item => ({
          role: item?.role as string,
          content: item?.content as string,
        })),
    ];

    cursor = res.cursor;
    round += 1;

    if (!res.hasmore) {
      break;
    }
  }

  return messageList;
};

export const useChatHistory = (botId?: string) => {
  const { botInfo, isLoading: isBotInfoLoading } = useBotInfo(botId);

  const botCount =
    transformBotInfo.model(botInfo)?.short_memory_policy?.history_round ?? 0;

  const { isLoading: isMessageLoading, data: messageList } = useQuery({
    queryKey: ['bot_info', botId, botCount],
    queryFn: () =>
      getMessageList({
        botId: botId as string,
        botCount,
      }),
    enabled: botCount !== undefined,
  });

  return {
    chatHistory: messageList?.length
      ? {
          chatHistory: messageList,
        }
      : null,
    isLoading: isBotInfoLoading || isMessageLoading,
  };
};
