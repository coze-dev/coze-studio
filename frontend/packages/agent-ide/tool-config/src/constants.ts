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

// TODO: 这里应该让业务不感知
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
 * 这里的顺序 决定展示的顺序 请注意
 */
export const TOOL_GROUP_CONFIG = {
  [ToolGroupKey.SKILL]: 'Skill',
  [ToolGroupKey.KNOWLEDGE]: 'Knowledge',
  [ToolGroupKey.MEMORY]: 'Memory',
  [ToolGroupKey.DIALOG]: 'Dialog',
  [ToolGroupKey.CHARACTER]: 'Character',
  [ToolGroupKey.HOOKS]: 'Hooks',
};
