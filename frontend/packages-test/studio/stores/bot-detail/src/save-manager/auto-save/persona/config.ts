import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import {
  usePersonaStore,
  type PersonaStore,
  type RequiredBotPrompt,
} from '@/store/persona';
import { ItemType } from '@/save-manager/types';

type RegisterSystemContent = HostedObserverConfig<
  PersonaStore,
  ItemType,
  RequiredBotPrompt
>;

export const personaConfig: RegisterSystemContent = {
  key: ItemType.SYSTEMINFO,
  selector: state => state.systemMessage,
  debounce: () => {
    const { systemMessage } = usePersonaStore.getState();
    const { isOptimize } = systemMessage;

    console.log('systemMessage:>>', systemMessage);
    console.log('isOptimize:>>', isOptimize);
    if (isOptimize) {
      return DebounceTime.Immediate;
    }
    return DebounceTime.Long;
  },
  middleware: {
    onBeforeSave: nextState => ({
      prompt_info: usePersonaStore.getState().transformVo2Dto(nextState),
    }),
  },
};
