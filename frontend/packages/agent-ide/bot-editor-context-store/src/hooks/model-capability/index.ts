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

import { useShallow } from 'zustand/react/shallow';
import { useMultiAgentStore } from '@coze-studio/bot-detail-store/multi-agent';
import { useModelStore as useBotDetailModelStore } from '@coze-studio/bot-detail-store/model';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { BotMode } from '@coze-arch/bot-api/developer_api';

import {
  defaultModelCapConfig,
  getMultiAgentModelCapabilityConfig,
  getSingleAgentModelCapabilityConfig,
  type TGetModelCapabilityConfig,
} from '../../utils/model-capability';
import { useBotEditor } from '../../context/bot-editor-context';

const getModelCapabilityConfigMap: Record<BotMode, TGetModelCapabilityConfig> =
  {
    [BotMode.SingleMode]: getSingleAgentModelCapabilityConfig,
    [BotMode.WorkflowMode]: () => defaultModelCapConfig,
    [BotMode.MultiMode]: getMultiAgentModelCapabilityConfig,
  };

export const useModelCapabilityConfig = () => {
  const {
    storeSet: { useModelStore },
  } = useBotEditor();
  const getModelById = useModelStore(store => store.getModelById);
  const mode = useBotInfoStore(store => store.mode);
  const modelIds = useGetModelIdsByMode(mode);
  return getModelCapabilityConfigMap[mode]({
    modelIds,
    getModelById,
  });
};

const useGetModelIdsByMode = (mode: BotMode) => {
  const { multiModelIds } = useMultiAgentStore(
    useShallow(store => ({
      multiModelIds: Array.from(
        store.agents
          .reduce<Set<string>>((res, agent) => {
            if (agent.model.model !== undefined) {
              res.add(agent.model.model);
            }
            return res;
          }, new Set())
          .values(),
      ),
    })),
  );
  const singleModeId = useBotDetailModelStore(
    store => store.config.model ?? '',
  );
  const getModeIdsMap: Record<BotMode, string[]> = {
    [BotMode.SingleMode]: [singleModeId],
    [BotMode.MultiMode]: multiModelIds,
    [BotMode.WorkflowMode]: [],
  };
  return getModeIdsMap[mode];
};
