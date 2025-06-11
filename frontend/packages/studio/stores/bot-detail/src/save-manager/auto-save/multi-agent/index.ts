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
  // key: ScopeKey,
  // diff: DiffChange[],
) =>
  await saveFetcher(() => {
    // TODO: 按需提交
    // const params = {};
    // for (const change of diff) {
    //   const changePath = change.path[0];
    //   params[changePath] = payload[changePath];
    // }

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
