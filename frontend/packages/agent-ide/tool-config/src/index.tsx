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

export {
  AbilityScope,
  ToolKey,
  AgentSkillKey,
  AgentModalTabKey,
  AbilityKey,
  ToolGroupKey,
  SkillKeyEnum,
} from './types';
export {
  TOOL_KEY_STORE_MAP,
  AGENT_SKILL_KEY_MAP,
  TOOL_KEY_TO_API_STATUS_KEY_MAP,
  TOOL_GROUP_CONFIG,
} from './constants';
export {
  ShortCutCommand,
  TemplateShortCutForWorkFlow,
  QueryShortCut,
  TemplateShortCutForPlugin,
} from './shortcut-config/type';
export { getStrictShortcuts } from './shortcut-config/get-strict-shortcuts';
export { ShortCutStruct } from './shortcut-config/type';
