import { createContext } from 'react';

import { type ChatAnswerActionPreference } from './type';

export const AnswerActionPreferenceContext =
  createContext<ChatAnswerActionPreference>({
    enableBotTriggerControl: false,
  });
