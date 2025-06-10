import { type ModelInfo } from '@coze-arch/bot-api/developer_api';
import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import { type ModelStore, useModelStore } from '@/store/model';
import { ItemType } from '@/save-manager/types';

type RegisterSystemContent = HostedObserverConfig<
  ModelStore,
  ItemType,
  ModelInfo
>;

export const modelConfig: RegisterSystemContent = {
  key: ItemType.OTHERINFO,
  selector: store => store.config,
  debounce: {
    default: DebounceTime.Immediate,
    temperature: DebounceTime.Medium,
    max_tokens: DebounceTime.Medium,
    'ShortMemPolicy.HistoryRound': DebounceTime.Medium,
  },
  middleware: {
    onBeforeSave: dataSource => ({
      model_info: useModelStore.getState().transformVo2Dto(dataSource),
    }),
  },
};
