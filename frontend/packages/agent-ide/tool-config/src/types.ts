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

export const enum AbilityScope {
  TOOL = 'tool',
  AGENT_SKILL = 'agentSkill',
}

export type AbilityKey = ToolKey | AgentSkillKey;

/**
 * ToolKey has temporarily given everyone a name for the project. If you think the name is not good, you can replace it globally.
 */
export const enum ToolKey {
  PLUGIN = 'plugin',
  WORKFLOW = 'workflow',
  IMAGEFLOW = 'imageflow',
  KNOWLEDGE = 'knowledge',
  VARIABLE = 'variable',
  DATABASE = 'database',
  LONG_TERM_MEMORY = 'longTermMemory',
  FILE_BOX = 'fileBox',
  TRIGGER = 'trigger',
  ONBOARDING = 'onboarding',
  SUGGEST = 'suggest',
  VOICE = 'voice',
  BACKGROUND = 'background',
  DOCUMENT = 'document',
  TABLE = 'table',
  PHOTO = 'photo',
  SHORTCUT = 'shortcut',
  DEV_HOOKS = 'devHooks',
  USER_INPUT = 'userInput',
}

export const enum AgentSkillKey {
  PLUGIN = 'plugin',
  WORKFLOW = 'workflow',
  KNOWLEDGE = 'knowledge',
}

export const enum AgentModalTabKey {
  TOOLS = 'tools',
  WORKFLOW = 'workflow',
  DATASETS = 'datasets',
}

export const enum ToolGroupKey {
  SKILL = 'skill',
  KNOWLEDGE = 'knowledge',
  MEMORY = 'memory',
  DIALOG = 'dialog',
  HOOKS = 'hooks',
  CHARACTER = 'character',
}

/**
 * module primary key
 * @Deprecated This usage is deprecated, please use: 'import {ToolKey} from' @code-agent-ide/tool-config ';
 */
export enum SkillKeyEnum {
  /** Skills */
  PLUGIN_API_BLOCK = 'plugin',
  WORKFLOW_BLOCK = 'workflow',
  IMAGE_BLOCK = 'imageflow',
  /** Memory */
  DATA_SET_BLOCK = 'knowledge',
  DATA_MEMORY_BLOCK = 'variable',
  TABLE_MEMORY_BLOCK = 'database',
  TIME_CAPSULE_BLOCK = 'time_capsule',
  FILEBOX_BLOCK = 'filebox',
  /** Advanced */
  TASK_MANAGE_BLOCK = 'scheduled_task',
  ONBORDING_MESSAGE_BLOCK = 'opening_dialog',
  AUTO_SUGGESTION = 'suggestion',
  TEXT_TO_SPEECH = 'tts',
  BACKGROUND_IMAGE_BLOCK = 'background_image',
}
