import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import type { KnowledgeConfig } from '@/types/skill';
import { type BotSkillStore, useBotSkillStore } from '@/store/bot-skill';
import { ItemType } from '@/save-manager/types';

type RegisterKnowledge = HostedObserverConfig<
  BotSkillStore,
  ItemType,
  KnowledgeConfig
>;

export const knowledgeConfig: RegisterKnowledge = {
  key: ItemType.DataSet,
  selector: store => store.knowledge,
  debounce: {
    default: DebounceTime.Immediate,
    'dataSetInfo.min_score': DebounceTime.Medium,
    'dataSetInfo.top_k': DebounceTime.Medium,
  },
  middleware: {
    onBeforeSave: dataSource => ({
      knowledge: useBotSkillStore
        .getState()
        .transformVo2Dto.knowledge(dataSource),
    }),
  },
};
