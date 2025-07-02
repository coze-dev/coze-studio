import { AutosaveManager } from '@coze-studio/autosave';

import {
  usePersonaStore,
  type PersonaStore,
  type RequiredBotPrompt,
} from '@/store/persona';
import { type ItemType } from '@/save-manager/types';

import { saveRequest } from '../request';
import { personaConfig } from './config';

export const personaSaveManager = new AutosaveManager<
  PersonaStore,
  ItemType,
  RequiredBotPrompt
>({
  store: usePersonaStore,
  registers: [personaConfig],
  saveRequest,
});
