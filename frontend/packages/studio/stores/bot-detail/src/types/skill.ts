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

import { type ShortCutStruct } from '@coze-agent-ide/tool-config/src/shortcut-config/type';
import {
  type PluginStatus,
  type PluginType,
} from '@coze-arch/idl/plugin_develop';
import { type WorkflowMode } from '@coze-arch/bot-api/workflow_api';
import {
  type HookInfo,
  type LayoutInfo,
  type BackgroundImageInfo,
  type SuggestedQuestionsShowMode,
  type DisablePromptCalling,
  type RecallStrategy,
  type DefaultUserInputType,
} from '@coze-arch/bot-api/playground_api';
import { type BotTableRWMode, type FieldItem } from '@coze-arch/bot-api/memory';
import { type Dataset } from '@coze-arch/bot-api/knowledge';
import type {
  FileboxInfo,
  PluginApi,
  PluginParameter,
  TaskInfoData,
  TaskInfo,
  SuggestReplyMode,
} from '@coze-arch/bot-api/developer_api';

interface DefaultPluginApi extends PluginApi {
  isAuto?: boolean;
  autoAddCss?: boolean;
  // #The plugin dimension field where the region api is located
  plugin_type?: PluginType;
  is_official?: boolean;
  plugin_icon?: string;
  status?: PluginStatus;
  // #endregion
}
export type EnabledPluginApi = Omit<DefaultPluginApi, 'debug_example'>;

export interface BotDetailSkill {
  // Region Bot and Agent dimension common skills
  /** Selected plugin api */
  pluginApis: EnabledPluginApi[];
  /** Selected workflow */
  workflows: WorkFlowItemType[];
  /** Knowledge Allocation */
  knowledge: KnowledgeConfig;
  // endregion

  // Region Bot Dimension Unique skills
  /**
   * Task configuration
   *
   * No added tasks are included, and those added are managed independently within the component
   */
  taskInfo: TaskManageInfo;
  /**
   * Variable default configuration
   *
   * The present value in the upper right corner is not included. The present value is the component state requested after opening the pop-up window.
   */
  variables: VariableItem[];
  /**
   * Database default configuration
   *
   * The present value in the upper right corner is not included. The present value is the component state requested after opening the pop-up window.
   */
  database: DatabaseInfo;
  /**
   * Database multi-table default configuration
   *
   * The present value in the upper right corner is not included. The present value is the component state requested after opening the pop-up window.
   */
  databaseList: DatabaseList;
  /** Opener configuration */
  onboardingContent: ExtendOnboardingContent;
  /** User Questions Suggested Configuration */
  suggestionConfig: BotSuggestionConfig;
  // endregion
  /** Text to Speech */
  tts: TTSInfo;
  // Time Capsule
  timeCapsule: TimeCapsuleConfig;
  filebox: FileboxConfig;
  // Chat background cover
  backgroundImageInfoList: BackgroundImageInfo[];
  // Quick Instruction
  shortcut: ShortCutStruct;
  // hooks
  devHooks?: HookInfo;
  layoutInfo: LayoutInfo;
}

export interface TaskManageInfo {
  user_task_allowed: boolean;
  /** Request task loading status, business usage */
  loading: boolean;
  /** Task interface data, business use */
  data: TaskInfoData[];
  /** New task interface data for business use */
  task_list: TaskInfo[];
}

export enum VariableKeyErrType {
  KEY_CHECK_PASS = 0, // Check passed
  KEY_NAME_USED = 1, // Name is occupied

  KEY_IS_NULL = 2, // is null
}

export interface TableMemoryItem extends FieldItem {
  errorMapper?: Record<string, string[]>;
  disableMustRequired?: boolean;
  nanoid?: string;
  /**
   * Is it a built-in field?
   * @Description Built-in field: For display only, users cannot modify it, and fields with the same name cannot be created
   */
  isSystemField?: boolean;
}

export interface DatabaseInfo {
  tableId: string;
  name: string;
  desc: string;
  icon_uri?: string;
  extra_info?: Record<string, string>;
  readAndWriteMode: BotTableRWMode;
  tableMemoryList: TableMemoryItem[];
}
export type DatabaseList = DatabaseInfo[];

export interface VariableItem {
  id?: string;
  key?: string;
  description?: string;
  enable?: boolean;
  channel?: string;
  default_value?: string;
  errType?: VariableKeyErrType;
  is_system?: boolean;
  prompt_disabled?: boolean;
  is_disabled?: boolean;
}

export interface TagListType {
  tagName: string;
  key: string;
  id: string;
  name: string;
  style_id: string;
  language_code: string;
  language_name: string;
}

export interface ChatVoiceType {
  key?: string;
  id: string;
  name?: string;
  style_id: string;
  language_code: string;
  language_name?: string;
}
export interface DebugStateType {
  bot_id: string;
  voice_id?: string;
  enable?: boolean;
  style_id?: string;
}
export interface TTSInfo {
  muted: boolean;
  close_voice_call: boolean;
  i18n_lang_voice: Record<string, number>;
  i18n_lang_voice_str: Record<string, string>;
  autoplay: boolean;
  autoplay_voice: Record<string, number>;
  tag_list?: TagListType[];
  chatVoiceList?: ChatVoiceType[];
  debugVoice: DebugStateType[];
}

export enum TimeCapsuleOptionsEnum {
  ON = 1,
  OFF = 0,
}

export interface TimeCapsuleConfig {
  time_capsule_mode: TimeCapsuleOptionsEnum;
  disable_prompt_calling: DisablePromptCalling;
  time_capsule_time_to_live: string;
}

export interface WorkFlowItemType {
  workflow_id: string;
  plugin_id: string;
  name: string;
  desc: string;
  parameters: Array<PluginParameter>;
  plugin_icon: string;
  flow_mode?: WorkflowMode;
}

export interface KnowledgeConfig {
  /** Selected knowledge */
  dataSetList: Array<Dataset>;
  dataSetInfo: {
    min_score: number;
    search_strategy?: number;
    top_k: number;
    auto: boolean;
    show_source?: boolean;
    no_recall_reply_mode?: number;
    no_recall_reply_customize_prompt?: string;
    show_source_mode?: number;
    recall_strategy?: RecallStrategy;
  };
}

export interface SuggestQuestionMessage {
  id: string;
  content: string;
  highlight?: boolean;
}
export interface ExtendOnboardingContent {
  prologue: string;
  suggested_questions: SuggestQuestionMessage[];
  suggested_questions_show_mode: SuggestedQuestionsShowMode;
}

export interface BotSuggestionConfig {
  /** 0 on; 1 custom; 2 off; 3 follow bot (agentflow bot nodes only) */
  suggest_reply_mode: SuggestReplyMode;
  customized_suggest_prompt: string;
}

export interface FileboxConfig {
  mode: FileboxInfo['mode'];
}

export interface VoicesInfo {
  defaultUserInputType: DefaultUserInputType | undefined;
}
