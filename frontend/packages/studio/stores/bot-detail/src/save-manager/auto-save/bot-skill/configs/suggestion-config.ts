import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import type { BotSuggestionConfig } from '@/types/skill';
import { type BotSkillStore, useBotSkillStore } from '@/store/bot-skill';
import { ItemType } from '@/save-manager/types';

type RegisterSuggestionConfig = HostedObserverConfig<
  BotSkillStore,
  ItemType,
  BotSuggestionConfig
>;

export const suggestionConfig: RegisterSuggestionConfig = {
  key: ItemType.SUGGESTREPLY,
  selector: store => store.suggestionConfig,
  debounce: {
    default: DebounceTime.Immediate,
    customized_suggest_prompt: DebounceTime.Long,
  },
  middleware: {
    onBeforeSave: dataSource => ({
      suggest_reply_info: useBotSkillStore
        .getState()
        .transformVo2Dto.suggestionConfig(dataSource),
    }),
  },
};
