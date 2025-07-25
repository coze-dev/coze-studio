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
import {
  type BotTableRWMode,
  type FieldItem,
} from '@coze-arch/bot-api/memory';
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
  // #region api所在的 plugin 维度字段
  plugin_type?: PluginType;
  is_official?: boolean;
  plugin_icon?: string;
  status?: PluginStatus;
  // #endregion
}
export type EnabledPluginApi = Omit<DefaultPluginApi, 'debug_example'>;

export interface BotDetailSkill {
  // region Bot 和 Agent 维度共有 skills
  /** 已选的 plugin api */
  pluginApis: EnabledPluginApi[];
  /** 已选 workflow */
  workflows: WorkFlowItemType[];
  /** Knowledge 配置 */
  knowledge: KnowledgeConfig;
  // endregion

  // region Bot 维度独有 skills
  /**
   * task 配置
   *
   * 不含已添加的 task，已添加的在组件内独立管理
   */
  taskInfo: TaskManageInfo;
  /**
   * variable 默认值配置
   *
   * 不含右上角现值，现值为打开弹窗后请求获得的组件状态
   */
  variables: VariableItem[];
  /**
   * database 默认值配置
   *
   * 不含右上角现值，现值为打开弹窗后请求获得的组件状态
   */
  database: DatabaseInfo;
  /**
   * database 多表默认值配置
   *
   * 不含右上角现值，现值为打开弹窗后请求获得的组件状态
   */
  databaseList: DatabaseList;
  /** 开场白配置 */
  onboardingContent: ExtendOnboardingContent;
  /** 用户问题建议配置 */
  suggestionConfig: BotSuggestionConfig;
  // endregion
  /** 文字转语音 */
  tts: TTSInfo;
  // 时间胶囊
  timeCapsule: TimeCapsuleConfig;
  filebox: FileboxConfig;
  // 聊天背景图
  backgroundImageInfoList: BackgroundImageInfo[];
  // 快捷指令
  shortcut: ShortCutStruct;
  // hooks
  devHooks?: HookInfo;
  layoutInfo: LayoutInfo;
}

export interface TaskManageInfo {
  user_task_allowed: boolean;
  /** 请求task loading状态，业务使用 */
  loading: boolean;
  /** task接口数据，业务使用 */
  data: TaskInfoData[];
  /** 新版task接口数据，业务使用 */
  task_list: TaskInfo[];
}

export enum VariableKeyErrType {
  KEY_CHECK_PASS = 0, // 检查通过
  KEY_NAME_USED = 1, // 名称被占用

  KEY_IS_NULL = 2, // 为空值
}

export interface TableMemoryItem extends FieldItem {
  errorMapper?: Record<string, string[]>;
  disableMustRequired?: boolean;
  nanoid?: string;
  /**
   * 是否是内置字段
   * @description 内置字段: 仅作展示用，用户不可修改，不可创建同名字段
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
  /** 已选的 knowledge */
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
  /** 0 开启; 1 自定义; 2 关闭; 3 跟随 bot（仅 agentflow bot 节点） */
  suggest_reply_mode: SuggestReplyMode;
  customized_suggest_prompt: string;
}

export interface FileboxConfig {
  mode: FileboxInfo['mode'];
}

export interface VoicesInfo {
  defaultUserInputType: DefaultUserInputType | undefined;
}
