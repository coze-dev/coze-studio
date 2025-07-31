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
