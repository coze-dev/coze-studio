import { type OnboardingInfo } from '@coze-arch/bot-api/playground_api';
import { DebounceTime, type HostedObserverConfig } from '@coze-studio/autosave';

import type { ExtendOnboardingContent } from '@/types/skill';
import { useBotSkillStore } from '@/store/bot-skill';
import type { BotSkillStore } from '@/store/bot-skill';
import { ItemType } from '@/save-manager/types';

type RegisterOnboardingContent = HostedObserverConfig<
  BotSkillStore,
  ItemType,
  ExtendOnboardingContent
>;

export const onboardingConfig: RegisterOnboardingContent = {
  key: ItemType.ONBOARDING,
  selector: {
    deps: [state => state.onboardingContent],
    transformer: onboardingContent =>
      useBotSkillStore.getState().transformVo2Dto.onboarding(onboardingContent),
  },
  debounce: {
    default: DebounceTime.Immediate,
    prologue: DebounceTime.Long,
    suggested_questions: {
      arrayType: true,
      action: {
        N: DebounceTime.Immediate,
        D: DebounceTime.Immediate,
        E: DebounceTime.Long,
      },
    },
  },
  middleware: {
    onBeforeSave: (dataSource: OnboardingInfo) => ({
      onboarding_info: dataSource,
    }),
  },
};
