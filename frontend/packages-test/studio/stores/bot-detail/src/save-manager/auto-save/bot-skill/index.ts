import { AutosaveManager } from '@coze-studio/autosave';

import { useBotSkillStore, type BotSkillStore } from '@/store/bot-skill';
import { type BizKey, type ScopeStateType } from '@/save-manager/types';

import { saveRequest } from '../request';
import { registers } from './configs';

export const botSkillSaveManager = new AutosaveManager<
  BotSkillStore,
  BizKey,
  ScopeStateType
>({
  store: useBotSkillStore,
  registers,
  saveRequest,
});
