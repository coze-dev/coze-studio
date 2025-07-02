import { type LayoutInfo } from '@coze-arch/idl/developer_api';
import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import { type BotSkillStore, useBotSkillStore } from '@/store/bot-skill';
import { ItemTypeExtra } from '@/save-manager/types';

type RegisterLayoutInfo = HostedObserverConfig<
  BotSkillStore,
  ItemTypeExtra,
  LayoutInfo
>;

export const layoutInfoConfig: RegisterLayoutInfo = {
  key: ItemTypeExtra.LayoutInfo,
  selector: store => store.layoutInfo,
  debounce: DebounceTime.Immediate,
  middleware: {
    onBeforeSave: layoutInfo => ({
      layout_info: useBotSkillStore
        .getState()
        .transformVo2Dto.layoutInfo(layoutInfo),
    }),
  },
};
