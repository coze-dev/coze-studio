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

import { type TabDisplayItems } from '@coze-arch/bot-api/developer_api';

import { ToolKey, AgentSkillKey, ToolGroupKey } from './types';

export const TOOL_KEY_STORE_MAP = {
  [ToolKey.PLUGIN]: 'pluginApis',
  [ToolKey.SHORTCUT]: 'shortcut',
  [ToolKey.DEV_HOOKS]: 'devHooks',
};

export const AGENT_SKILL_KEY_MAP = {
  [AgentSkillKey.PLUGIN]: 'pluginApis',
};

export const TOOL_KEY_TO_API_STATUS_KEY_MAP: {
  [key in ToolKey]: keyof TabDisplayItems;
} = {
  [ToolKey.PLUGIN]: 'plugin_tab_status',
  [ToolKey.WORKFLOW]: 'workflow_tab_status',
  [ToolKey.IMAGEFLOW]: 'imageflow_tab_status',
  [ToolKey.DATABASE]: 'database_tab_status',
  [ToolKey.FILE_BOX]: 'filebox_tab_status',
  [ToolKey.KNOWLEDGE]: 'knowledge_tab_status',
  [ToolKey.ONBOARDING]: 'opening_dialog_tab_status',
  [ToolKey.SUGGEST]: 'suggestion_tab_status',
  [ToolKey.TRIGGER]: 'scheduled_task_tab_status',
  [ToolKey.VARIABLE]: 'variable_tab_status',
  [ToolKey.VOICE]: 'tts_tab_status',
  [ToolKey.LONG_TERM_MEMORY]: 'long_term_memory_tab_status',
  [ToolKey.BACKGROUND]: 'background_image_tab_status',
  [ToolKey.TABLE]: 'knowledge_table_tab_status',
  [ToolKey.DOCUMENT]: 'knowledge_text_tab_status',
  [ToolKey.PHOTO]: 'knowledge_photo_tab_status',
  [ToolKey.SHORTCUT]: 'shortcut_tab_status',
  [ToolKey.DEV_HOOKS]: 'hook_info_tab_status',
  [ToolKey.USER_INPUT]: 'default_user_input_tab_status',
};

/**
 * The order here determines the order of presentation, please note
 */
export const TOOL_GROUP_CONFIG = {
  [ToolGroupKey.SKILL]: 'Skill',
  [ToolGroupKey.KNOWLEDGE]: 'Knowledge',
  [ToolGroupKey.MEMORY]: 'Memory',
  [ToolGroupKey.DIALOG]: 'Dialog',
  [ToolGroupKey.CHARACTER]: 'Character',
  [ToolGroupKey.HOOKS]: 'Hooks',
};
