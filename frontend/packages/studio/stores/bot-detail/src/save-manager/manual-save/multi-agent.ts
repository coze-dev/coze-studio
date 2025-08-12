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
import { type MultiAgentConnectorType } from '@coze-arch/bot-api/playground_api';
import { PlaygroundApi } from '@coze-arch/bot-api';
import { type LineType } from '@flowgram-adapter/free-layout-editor';

import { storage } from '@/utils/storage';
import type { Agent } from '@/types/agent';
import { useMultiAgentStore } from '@/store/multi-agent';
import { useBotInfoStore } from '@/store/bot-info';

import { saveFetcher } from '../utils/save-fetcher';
import { ItemTypeExtra } from '../types';

// Skills Structured Interface
export async function saveUpdateAgents(agent: Agent) {
  return await saveFetcher(
    () =>
      PlaygroundApi.UpdateAgentV2({
        ...useMultiAgentStore.getState().transformVo2Dto.agent(agent),
        bot_id: useBotInfoStore.getState().botId,
        space_id: useSpaceStore.getState().getSpaceId(),
        base_commit_version: storage.baseVersion,
      }),
    ItemTypeExtra.MultiAgent,
  );
}

export async function saveDeleteAgents(deleteAgentId: string) {
  return await saveFetcher(
    () =>
      PlaygroundApi.UpdateAgentV2({
        bot_id: useBotInfoStore.getState().botId,
        space_id: useSpaceStore.getState().getSpaceId(),
        id: deleteAgentId,
        is_delete: true,
        base_commit_version: storage.baseVersion,
      }),
    ItemTypeExtra.MultiAgent,
  );
}

export function saveDeleteAgentsV3(deleteAgentId: string) {
  return saveFetcher(
    () =>
      PlaygroundApi.UpdateAgentV2({
        bot_id: useBotInfoStore.getState().botId,
        space_id: useSpaceStore.getState().getSpaceId(),
        id: deleteAgentId,
        is_delete: true,
        base_commit_version: storage.baseVersion,
      }),
    ItemTypeExtra.MultiAgent,
  );
}

export async function saveMultiAgentData() {
  return await saveFetcher(
    () =>
      PlaygroundApi.UpdateMultiAgent({
        space_id: useSpaceStore.getState().getSpaceId(),
        bot_id: useBotInfoStore.getState().botId,
        session_type: useMultiAgentStore.getState().chatModeConfig.type,
        base_commit_version: storage.baseVersion,
      }),
    ItemTypeExtra.MultiAgent,
  );
}

export async function saveConnectorType(connectorType: LineType) {
  return await saveFetcher(
    () =>
      PlaygroundApi.UpdateMultiAgent({
        space_id: useSpaceStore.getState().getSpaceId(),
        bot_id: useBotInfoStore.getState().botId,
        connector_type: connectorType as unknown as MultiAgentConnectorType,
        base_commit_version: storage.baseVersion,
      }),
    ItemTypeExtra.ConnectorType,
  );
}
