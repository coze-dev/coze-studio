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

import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { PlaygroundApi } from '@coze-arch/bot-api';
import { AutosaveManager, type SaveRequest } from '@coze-studio/autosave';

import { storage } from '@/utils/storage';
import type { Agent } from '@/types/agent';
import {
  type MultiAgentStore,
  useMultiAgentStore,
} from '@/store/multi-agent/store';
import { useBotInfoStore } from '@/store/bot-info';

import { saveFetcher } from '../../utils/save-fetcher';
import { ItemTypeExtra } from '../../types';
import { registerMultiAgentConfig } from './config';

const saveRequestAgent: SaveRequest<Agent, ItemTypeExtra> = async (
  payload: Agent,
) =>
  await saveFetcher(() => {
    const params = useMultiAgentStore.getState().transformVo2Dto.agent(payload);
    return PlaygroundApi.UpdateAgentV2({
      ...params,
      id: payload.id,
      bot_id: useBotInfoStore.getState().botId,
      space_id: useSpaceStore.getState().getSpaceId(),
      base_commit_version: storage.baseVersion,
    });
  }, ItemTypeExtra.MultiAgent);

export const multiAgentSaveManager = new AutosaveManager<
  MultiAgentStore,
  ItemTypeExtra,
  Agent
>({
  store: useMultiAgentStore,
  registers: [registerMultiAgentConfig],
  saveRequest: saveRequestAgent,
});
