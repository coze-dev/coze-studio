import { merge } from 'lodash-es';
import { type BotInfoForUpdate } from '@coze-arch/idl/playground_api';
import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import { type TTSInfo, type VoicesInfo } from '@/types/skill';
import { transformVo2Dto } from '@/store/bot-skill/transform';
import { type BotSkillStore } from '@/store/bot-skill';
import { ItemType } from '@/save-manager/types';

interface Values {
  voicesInfo: VoicesInfo;
  tts: TTSInfo;
}

type RegisterVariables = HostedObserverConfig<BotSkillStore, ItemType, Values>;

export const voicesInfoConfig: RegisterVariables = {
  key: ItemType.PROFILEMEMORY,
  selector: store => ({ voicesInfo: store.voicesInfo, tts: store.tts }),
  debounce: DebounceTime.Immediate,
  middleware: {
    // ! any warning 改动的时候要仔细
    onBeforeSave: (
      values: Values,
    ): Pick<Required<BotInfoForUpdate>, 'voices_info'> => ({
      voices_info: merge(
        {},
        transformVo2Dto.tts(values.tts),
        transformVo2Dto.voicesInfo(values.voicesInfo),
      ),
    }),
  },
};
