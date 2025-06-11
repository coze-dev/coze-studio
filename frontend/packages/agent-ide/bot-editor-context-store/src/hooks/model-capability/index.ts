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
    // workflow 不涉及到模型，按全部支持处理
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
