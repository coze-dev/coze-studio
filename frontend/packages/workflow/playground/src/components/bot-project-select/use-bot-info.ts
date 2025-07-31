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
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import {
  type GetDraftBotInfoAgwData,
  type ModelInfo,
} from '@coze-arch/bot-api/playground_api';
import { type BotTable } from '@coze-arch/bot-api/memory';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { type IBotSelectOption } from './types';

export const useBotInfo = (botId?: string) => {
  const { isLoading, data: botInfo } = useQuery({
    queryKey: ['bot_info', botId || ''],
    queryFn: async () => {
      if (!botId) {
        return undefined;
      }

      const { data } = await PlaygroundApi.GetDraftBotInfoAgw({
        bot_id: botId,
      });
      return data;
    },
  });

  return { isLoading, botInfo };
};

// Data conversion using bot information for wf
export const transformBotInfo = {
  // model data
  model: (data?: GetDraftBotInfoAgwData): ModelInfo =>
    data?.bot_info?.model_info ?? {},
  // Basic information data
  basicInfo: (
    botInfo?: GetDraftBotInfoAgwData,
  ): IBotSelectOption | undefined => {
    if (!botInfo) {
      return undefined;
    }
    return {
      name: botInfo?.bot_info?.name ?? '',
      avatar: botInfo?.bot_info?.icon_url ?? '',
      value: botInfo?.bot_info?.bot_id ?? '',
      type: IntelligenceType.Bot,
    };
  },
  // database information
  database: (botInfo?: GetDraftBotInfoAgwData): BotTable[] | undefined =>
    botInfo?.bot_info?.database_list,
  // Variable information
  variable: (botInfo?: GetDraftBotInfoAgwData) =>
    botInfo?.bot_info?.variable_list,
};
