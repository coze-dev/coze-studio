import { type HostedObserverConfig } from '@coze-studio/autosave';

import { type BotSkillStore } from '@/store/bot-skill';
import { type BizKey, type ScopeStateType } from '@/save-manager/types';

import { workflowsConfig } from './workflows';
import { voicesInfoConfig } from './voices-info';
import { variablesConfig } from './variables';
import { taskInfoConfig } from './task-info';
import { suggestionConfig } from './suggestion-config';
import { pluginConfig } from './plugin';
import { onboardingConfig } from './onboarding-content';
import { layoutInfoConfig } from './layout-info';
import { knowledgeConfig } from './knowledge';
import { chatBackgroundConfig } from './chat-background';

export const registers: HostedObserverConfig<
  BotSkillStore,
  BizKey,
  ScopeStateType
>[] = [
  pluginConfig,
  chatBackgroundConfig,
  onboardingConfig,
  knowledgeConfig,
  layoutInfoConfig,
  suggestionConfig,
  taskInfoConfig,
  variablesConfig,
  workflowsConfig,
  voicesInfoConfig,
];
