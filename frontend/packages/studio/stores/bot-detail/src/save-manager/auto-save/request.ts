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

import { PlaygroundApi } from '@coze-arch/bot-api';
import { type SaveRequest } from '@coze-studio/autosave';

import { storage } from '@/utils/storage';
import { useBotInfoStore } from '@/store/bot-info';
import { type BizKey, type ScopeStateType } from '@/save-manager/types';

import { saveFetcher } from '../utils/save-fetcher';

/**
 * Autosave Uniform Request Method
 */
export const saveRequest: SaveRequest<ScopeStateType, BizKey> = async (
  payload: ScopeStateType,
  itemType: BizKey,
) => {
  const { botId } = useBotInfoStore.getState();

  await saveFetcher(
    async () =>
      await PlaygroundApi.UpdateDraftBotInfoAgw({
        bot_info: {
          bot_id: botId,
          ...payload,
        },
        base_commit_version: storage.baseVersion,
      }),
    itemType,
  );
};
