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

import { nanoid } from 'nanoid';
import { isNumber, mapValues } from 'lodash-es';
import {
  type PluginStatus,
  type PluginType,
} from '@coze-arch/idl/plugin_develop';
import { BotTableRWMode } from '@coze-arch/idl/memory';
import {
  type Int64,
  type PluginInfo,
  type PluginDetal,
  type PluginAPIDetal,
  type WorkflowInfo,
  type WorkflowDetail,
  type Knowledge,
  type KnowledgeDetail,
  type TaskInfo,
  type Variable,
  type Database,
  type TimeCapsuleInfo,
  type OnboardingInfo,
  type SuggestReplyInfo,
  type VoicesInfo as IDLVoicesInfo,
  type FileboxInfo,
  FileboxInfoMode,
  TimeCapsuleMode,
  type ShortcutCommand,
  type BotInfoForUpdate,
  type SuggestReplyMode as SuggestReplyModeFromPlayground,
  type HookInfo,
  SuggestedQuestionsShowMode,
  type LayoutInfo,
  DisablePromptCalling,
} from '@coze-arch/bot-api/playground_api';
import { SuggestReplyMode } from '@coze-arch/bot-api/developer_api';
import { type ShortCutStruct } from '@coze-agent-ide/tool-config';

import {
  type WorkFlowItemType,
  type EnabledPluginApi,
  type KnowledgeConfig,
  type TaskManageInfo,
  type VariableItem,
  type TimeCapsuleConfig,
  type ExtendOnboardingContent,
  type BotSuggestionConfig,
  type TTSInfo,
  type FileboxConfig,
  type DatabaseList,
  type TableMemoryItem,
  type VoicesInfo,
} from '../../types/skill';
import {
  DEFAULT_BOT_NODE_SUGGESTION_CONFIG,
  DEFAULT_KNOWLEDGE_CONFIG,
  DEFAULT_SUGGESTION_CONFIG,
  DEFAULT_SUGGESTION_PROMPT,
  DEFAULT_TTS_CONFIG,
} from './defaults';

// After the structured BotInfo interface, data transformation
export const transformDto2Vo = {
  plugin: (
    data?: PluginInfo[],
    plugins?: Record<Int64, PluginDetal>,
    pluginsAPIs?: Record<Int64, PluginAPIDetal>,
  ): EnabledPluginApi[] =>
    data
      ?.filter(i => i.plugin_id && i.api_id && plugins?.[i.plugin_id as string])
      ?.map(item => {
        const plugin = plugins?.[item.plugin_id as string];
        const api = pluginsAPIs?.[item.api_id as string];
        return {
          plugin_icon: plugin?.icon_url,
          name: api?.name,
          desc: api?.description,
          plugin_id: item.plugin_id,
          plugin_name: plugin?.name,
          api_id: item.api_id,
          parameters:
            api?.parameters?.map(i => ({
              ...i,
              // Compatible with open-source pages. Interface fields are named differently
              desc: i.description,
              required: i.is_required,
            })) || [],
          is_official: plugin?.is_official,
          // The historical reason for this type is that each service on the server level is not unified, and the actual business use is the enumeration type
          plugin_type: plugin?.plugin_type as unknown as PluginType,
          status: plugin?.plugin_status as unknown as PluginStatus,
        };
      }) ?? [],

  workflow: (
    data?: WorkflowInfo[],
    config?: Record<Int64, WorkflowDetail>,
  ): WorkFlowItemType[] =>
    data
      ?.filter(i => i.workflow_id && config?.[i.workflow_id])
      ?.map(item => {
        const w = config?.[item.workflow_id as string];
        return {
          workflow_id: w?.id ?? '',
          plugin_id: w?.plugin_id ?? '',
          name: w?.name ?? '',
          desc: w?.description ?? '',
          plugin_icon: w?.icon_url ?? '',
          flow_mode: item?.flow_mode,
          parameters:
            w?.api_detail?.parameters?.map(i => ({
              ...i,
              desc: i.description,
              required: i.is_required,
            })) || [],
        };
      }) ?? [],
  // Knowledge Base
  knowledge: (
    data?: Knowledge,
    config?: Record<string, KnowledgeDetail>,
  ): KnowledgeConfig => {
    if (!data) {
      return {
        dataSetList: [],
        dataSetInfo: DEFAULT_KNOWLEDGE_CONFIG(),
      };
    } else {
      const dataSetList =
        data?.knowledge_info
          ?.filter(i => i.id && config?.[i.id as string])
          ?.map(item => {
            const k = config?.[item.id as string];
            return {
              id: k?.id,
              name: k?.name,
              avatar_url: k?.icon_url,
              icon_url: k?.icon_url,
              dataset_id: k?.id,
            };
          }) ?? [];

      return {
        dataSetList,
        dataSetInfo: {
          min_score: data?.min_score ?? 0,
          top_k: Number(data?.top_k ?? 0),
          auto: Boolean(data?.auto),

          search_strategy: data?.search_strategy,
          no_recall_reply_mode: data?.no_recall_reply_mode,
          no_recall_reply_customize_prompt:
            data?.no_recall_reply_customize_prompt,
          show_source: data?.show_source,
          show_source_mode: data?.show_source_mode,
          recall_strategy: data.recall_strategy,
        },
      };
    }
  },

  task: (data?: TaskInfo): TaskManageInfo => ({
    user_task_allowed: Boolean(data?.user_task_allowed),
    task_list: [],
    loading: false,
    data: [],
  }),

  variables: (data?: Variable[]): VariableItem[] =>
    data?.map(item => ({
      id: nanoid(),
      key: item.key ?? '',
      description: item.description,
      default_value: item.default_value,
      is_system: !!item.is_system,
      prompt_disabled: !!item.prompt_disabled,
      is_disabled: !!item.is_disabled,
    })) ?? [],

  databaseList: (data?: Database[]): DatabaseList => {
    const res: DatabaseList = [];

    if (Array.isArray(data)) {
      data.forEach(target => {
        if (target?.table_id && target.field_list?.length) {
          res.push({
            tableId: target.table_id as string,
            name: target.table_name as string,
            desc: target.table_desc as string,
            extra_info: {
              prompt_disabled: String(target.prompt_disabled),
            },
            readAndWriteMode:
              (target.rw_mode as BotTableRWMode) ||
              BotTableRWMode.LimitedReadWrite,
            tableMemoryList: (target.field_list as TableMemoryItem[])?.map(
              i => ({
                ...i,
                nanoid: nanoid(),
                // Server level rpc has used the id of the string, which is difficult to modify. Here is compatible with the number required for subsequent links.
                id: Number(i.id),
              }),
            ),
          });
        }
      });
    }
    return res;
  },

  timeCapsule: (data?: TimeCapsuleInfo): TimeCapsuleConfig => ({
    // @ts-expect-error interface enumeration type value redefinition
    time_capsule_mode: data?.time_capsule_mode ?? TimeCapsuleMode.Off,
    disable_prompt_calling:
      data?.disable_prompt_calling ?? DisablePromptCalling.Off,
    time_capsule_time_to_live: data?.time_capsule_time_to_live ?? '0',
  }),

  filebox: (data?: FileboxInfo): FileboxConfig => ({
    mode: data?.Mode ?? FileboxInfoMode.Off,
  }),

  onboarding: (data?: OnboardingInfo): ExtendOnboardingContent => ({
    prologue: data?.prologue ?? '',
    suggested_questions_show_mode:
      data?.suggested_questions_show_mode ?? SuggestedQuestionsShowMode.Random,
    suggested_questions:
      data?.suggested_questions?.map(item => ({
        id: item,
        content: item,
      })) ?? [],
  }),

  suggestionConfig: (
    data?: SuggestReplyInfo,
    isBotNode = false,
  ): BotSuggestionConfig => {
    const defaultSuggestionConfig: BotSuggestionConfig = isBotNode
      ? DEFAULT_BOT_NODE_SUGGESTION_CONFIG()
      : DEFAULT_SUGGESTION_CONFIG();
    // @ts-expect-error xxxxxxxxxxx SuggestReplyMode The two file definitions are inconsistent
    const suggestionConfig: BotSuggestionConfig = isNumber(
      data?.suggest_reply_mode,
    )
      ? {
          suggest_reply_mode: data?.suggest_reply_mode,
          customized_suggest_prompt: data?.customized_suggest_prompt,
        }
      : defaultSuggestionConfig;

    if (
      !suggestionConfig.customized_suggest_prompt &&
      suggestionConfig.suggest_reply_mode ===
        SuggestReplyMode.WithCustomizedPrompt
    ) {
      suggestionConfig.customized_suggest_prompt = DEFAULT_SUGGESTION_PROMPT();
    }
    return suggestionConfig;
  },

  tts: (ttsConfig?: IDLVoicesInfo): TTSInfo => {
    if (!ttsConfig || typeof ttsConfig !== 'object') {
      return DEFAULT_TTS_CONFIG();
    }
    if (!('muted' in ttsConfig && 'i18n_lang_voice' in ttsConfig)) {
      return DEFAULT_TTS_CONFIG();
    }
    const isValidObject = (obj: unknown): Record<string, number> =>
      obj && typeof obj === 'object' ? (obj as Record<string, number>) : {};

    return {
      muted: !!ttsConfig.muted,
      close_voice_call: !!ttsConfig.voice_call,
      i18n_lang_voice: isValidObject(ttsConfig?.i18n_lang_voice),
      i18n_lang_voice_str: ttsConfig.i18n_lang_voice_str ?? {},
      autoplay: !!ttsConfig.autoplay,
      autoplay_voice: isValidObject(ttsConfig?.autoplay_voice),
      debugVoice: [],
    };
  },
  voicesInfo: (idlVoicesInfo: IDLVoicesInfo | undefined): VoicesInfo => ({
    defaultUserInputType: idlVoicesInfo?.default_user_input_type,
  }),
  shortcut: (
    shortcutSortList: string[],
    config?: ShortcutCommand[],
  ): ShortCutStruct => ({
    shortcut_sort: shortcutSortList,
    // @ts-expect-error ShortCutCommand The definition of the front and back ends is inconsistent, and the front-end differentiation is subject to type constraints
    shortcut_list: config,
  }),

  hookInfo: (data?: HookInfo): HookInfo | undefined => data,
  layoutInfo: (layoutInfoFromService?: LayoutInfo): LayoutInfo => ({
    workflow_id: layoutInfoFromService?.workflow_id,
    plugin_id: layoutInfoFromService?.plugin_id,
  }),
};

export const transformVo2Dto = {
  plugin: (plugins: EnabledPluginApi[]): BotInfoForUpdate['plugin_info_list'] =>
    plugins.map(plugin => ({
      api_id: plugin.api_id,
      plugin_id: plugin.plugin_id,
      api_name: plugin.name,
    })),

  workflow: (
    workflows: WorkFlowItemType[],
  ): BotInfoForUpdate['workflow_info_list'] =>
    workflows.map(
      w =>
        ({
          workflow_id: w.workflow_id,
          plugin_id: w.plugin_id,
          flow_mode: w.flow_mode,
          workflow_name: w.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any),
    ),

  knowledge: (knowledge: KnowledgeConfig): BotInfoForUpdate['knowledge'] => ({
    ...knowledge.dataSetInfo,
    knowledge_info: knowledge.dataSetList
      .filter(i => !!i.dataset_id)
      .map(dataset => ({
        id: dataset.dataset_id,
        name: dataset.name,
      })),
  }),

  task: (task: Partial<TaskManageInfo>): BotInfoForUpdate['task_info'] => ({
    user_task_allowed: task.user_task_allowed,
  }),

  suggestionConfig: (
    suggestion: BotSuggestionConfig,
  ): BotInfoForUpdate['suggest_reply_info'] => ({
    suggest_reply_mode:
      suggestion.suggest_reply_mode as unknown as SuggestReplyModeFromPlayground,
    customized_suggest_prompt: suggestion.customized_suggest_prompt,
  }),

  variables: (variables: VariableItem[]): BotInfoForUpdate['variable_list'] =>
    variables.map(v => ({
      key: v.key,
      description: v.description,
      default_value: v.default_value,
      is_system: v.is_system,
      prompt_disabled: v.prompt_disabled,
      is_disabled: v.is_disabled,
    })),

  databaseList: (
    databaseList: DatabaseList,
  ): BotInfoForUpdate['database_list'] =>
    // @ts-expect-error fix me late
    databaseList.map(d => ({
      table_id: d.tableId,
      table_name: d.name,
      table_desc: d.desc,
      rw_mode: d.readAndWriteMode,
      field_list: d.tableMemoryList.map(f => ({
        name: f.name,
        desc: f.desc,
        type: f.type,
        must_required: f.must_required,
        id: f.id?.toString(),
      })),
    })),

  timeCapsule: (
    timeCapsule: TimeCapsuleConfig,
  ): BotInfoForUpdate['bot_tag_info'] => ({
    time_capsule_info: {
      time_capsule_mode:
        timeCapsule.time_capsule_mode as unknown as TimeCapsuleMode,
      disable_prompt_calling:
        timeCapsule.disable_prompt_calling as unknown as DisablePromptCalling,
      time_capsule_time_to_live: timeCapsule.time_capsule_time_to_live,
    },
  }),

  filebox: (filebox: FileboxConfig): BotInfoForUpdate['filebox_info'] => ({
    Mode: filebox.mode,
  }),

  onboarding: (
    data: ExtendOnboardingContent,
  ): BotInfoForUpdate['onboarding_info'] => ({
    prologue: data.prologue,
    suggested_questions_show_mode: data.suggested_questions_show_mode,
    suggested_questions: data.suggested_questions
      .map(i => i.content?.trim())
      .filter(c => !!c),
  }),

  tts: (tts: Partial<TTSInfo>) => ({
    muted: tts.muted,
    i18n_lang_voice: tts.i18n_lang_voice,
    autoplay: tts.autoplay,
    autoplay_voice: tts.autoplay_voice,
    voice_call: tts.close_voice_call,
    i18n_lang_voice_str: tts.i18n_lang_voice_str,
  }),

  voicesInfo: (voicesInfo: VoicesInfo) => ({
    default_user_input_type: voicesInfo.defaultUserInputType,
  }),

  shortcut: (shortcut: ShortCutStruct): BotInfoForUpdate['shortcut_sort'] =>
    shortcut.shortcut_sort,

  layoutInfo: (info: LayoutInfo): BotInfoForUpdate['layout_info'] =>
    // Undefined will be filtered by axios, where the backend needs to have a key.
    mapValues(info, (val?: string) => val ?? ''),
};
