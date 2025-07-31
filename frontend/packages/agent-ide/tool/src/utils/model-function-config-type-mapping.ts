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

import { type AbilityKey } from '@coze-agent-ide/tool-config';
import { ModelFuncConfigType } from '@coze-arch/bot-api/developer_api';

// Mapping of AbilityKey to ModelFuncConfigType
const abilityKeyFuncConfigTypeMap: {
  // Make sure each key is configured here
  [key in AbilityKey]: ModelFuncConfigType | null;
} = {
  plugin: ModelFuncConfigType.Plugin,
  workflow: ModelFuncConfigType.Workflow,
  knowledge: null,
  imageflow: ModelFuncConfigType.ImageFlow,
  variable: ModelFuncConfigType.Variable,
  database: ModelFuncConfigType.Database,
  longTermMemory: ModelFuncConfigType.LongTermMemory,
  fileBox: ModelFuncConfigType.FileBox,
  trigger: ModelFuncConfigType.Trigger,
  onboarding: ModelFuncConfigType.Onboarding,
  suggest: ModelFuncConfigType.Suggestion,
  voice: ModelFuncConfigType.TTS,
  background: ModelFuncConfigType.BackGroundImage,
  document: ModelFuncConfigType.KnowledgeText,
  table: ModelFuncConfigType.KnowledgeTable,
  photo: ModelFuncConfigType.KnowledgePhoto,
  shortcut: ModelFuncConfigType.ShortcutCommand,
  devHooks: ModelFuncConfigType.HookInfo,
  userInput: ModelFuncConfigType.TTS,
};

export const abilityKey2ModelFunctionConfigType = (abilityKey: AbilityKey) =>
  abilityKeyFuncConfigTypeMap[abilityKey];
