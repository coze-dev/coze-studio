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
