import { type BackgroundImageInfo } from '@coze-arch/bot-api/developer_api';
import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import type { BotSkillStore } from '@/store/bot-skill';
import { ItemTypeExtra } from '@/save-manager/types';

type RegisterChatBackgroundConfig = HostedObserverConfig<
  BotSkillStore,
  ItemTypeExtra,
  BackgroundImageInfo[]
>;

export const chatBackgroundConfig: RegisterChatBackgroundConfig = {
  key: ItemTypeExtra.ChatBackGround,
  selector: store => store.backgroundImageInfoList,
  debounce: DebounceTime.Immediate,
  middleware: {
    onBeforeSave: dataSource => ({
      background_image_info_list: dataSource,
    }),
  },
};
