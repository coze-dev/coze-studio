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

import {
  SuggestReplyMode,
  type BackgroundImageInfo,
  FileboxInfoMode,
  BotTableRWMode,
  DefaultUserInputType,
} from '@coze-arch/bot-api/developer_api';

import { useBotDetailStoreSet } from '../../src/store/index';
import {
  getDefaultBotSkillStore,
  useBotSkillStore,
} from '../../src/store/bot-skill';

const DEFAULT_BOT_DETAIL = getDefaultBotSkillStore();

describe('useBotSkillStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });
  it('setBotSkill', () => {
    const botSkillToMerge = {
      filebox: {
        mode: FileboxInfoMode.On,
      },
    };

    useBotSkillStore.getState().setBotSkill(botSkillToMerge);

    expect(useBotSkillStore.getState()).toMatchObject(botSkillToMerge);

    const botSkillToReplace = Object.assign(
      {},
      DEFAULT_BOT_DETAIL,
      botSkillToMerge,
    );

    useBotSkillStore
      .getState()
      .setBotSkill(botSkillToReplace, { replace: true });

    expect(useBotSkillStore.getState()).toMatchObject(botSkillToMerge);
  });

  it('setBotSkillByImmer', () => {
    const botSkill = {
      filebox: {
        mode: FileboxInfoMode.On,
      },
    };

    useBotSkillStore.getState().setBotSkillByImmer(state => {
      state.filebox = botSkill.filebox;
    });

    expect(useBotSkillStore.getState()).toMatchObject(botSkill);
  });

  it('updateSkillPluginApis', () => {
    const skillPluginApis = [
      {
        name: 'fake plugin name',
      },
    ];

    useBotSkillStore.getState().updateSkillPluginApis(skillPluginApis);

    expect(useBotSkillStore.getState().pluginApis).toMatchObject(
      skillPluginApis,
    );
  });

  it('updateSkillWorkflows', () => {
    const skillWorkflows = [
      {
        name: 'fake workflow name',
        workflow_id: 'fake workflow ID',
        plugin_id: 'fake plugin ID',
        desc: 'fake workflow description',
        parameters: [{ name: "fake workflow parameter's name" }],
        plugin_icon: 'fake plugin icon',
      },
    ];

    useBotSkillStore.getState().updateSkillWorkflows(skillWorkflows);

    expect(useBotSkillStore.getState().workflows).toMatchObject(skillWorkflows);
  });

  it('updateSkillKnowledgeDatasetList', () => {
    const skillKnowledgeDatasetList = [
      {
        id: 'fake dataset ID',
        name: 'fake dataset name',
      },
    ];

    useBotSkillStore
      .getState()
      .updateSkillKnowledgeDatasetList(skillKnowledgeDatasetList);

    expect(useBotSkillStore.getState().knowledge.dataSetList).toMatchObject(
      skillKnowledgeDatasetList,
    );
  });

  it('updateSkillKnowledgeDatasetInfo', () => {
    const skillKnowledgeDatasetInfo = {
      min_score: 666,
      top_k: 666,
      auto: true,
    };

    useBotSkillStore
      .getState()
      .updateSkillKnowledgeDatasetInfo(skillKnowledgeDatasetInfo);

    expect(useBotSkillStore.getState().knowledge.dataSetInfo).toMatchObject(
      skillKnowledgeDatasetInfo,
    );
  });

  it('updateSkillTaskInfo', () => {
    const skillTaskInfo = {
      user_task_allowed: true,
      loading: true,
      data: [],
    };

    useBotSkillStore.getState().updateSkillTaskInfo(skillTaskInfo);

    expect(useBotSkillStore.getState().taskInfo).toMatchObject(skillTaskInfo);
  });

  it('updateSkillDatabase', () => {
    const skillDatabase = {
      tableId: 'fake table ID',
      name: 'fake table name',
      desc: 'fake table desc',
      tableMemoryList: [],
    };

    useBotSkillStore.getState().updateSkillDatabase(skillDatabase);

    expect(useBotSkillStore.getState().database).toMatchObject(skillDatabase);
  });

  it('updateSkillDatabaseList', () => {
    const dataList = [
      {
        tableId: 'fake table id',
        name: 'fake name',
        desc: 'fake desc',
        readAndWriteMode: BotTableRWMode.RWModeMax,
        tableMemoryList: [],
      },
    ];

    useBotSkillStore.getState().updateSkillDatabaseList(dataList);

    expect(useBotSkillStore.getState().databaseList).toStrictEqual(dataList);
  });

  it('updateSkillOnboarding', () => {
    const skillOnboarding = {
      prologue: 'fake prologue',
      suggested_questions: [],
    };

    useBotSkillStore.getState().updateSkillOnboarding(skillOnboarding);

    expect(useBotSkillStore.getState().onboardingContent).toMatchObject(
      skillOnboarding,
    );

    useBotDetailStoreSet.clear();
    useBotSkillStore.getState().updateSkillOnboarding(() => skillOnboarding);

    expect(useBotSkillStore.getState().onboardingContent).toMatchObject(
      skillOnboarding,
    );
  });

  it('updateSkillLayoutInfo', () => {
    const mockLayoutInfo = {
      workflow_id: 'wid',
      plugin_id: 'pid',
    };
    useBotSkillStore.getState().updateSkillLayoutInfo(mockLayoutInfo);
    expect(useBotSkillStore.getState().layoutInfo).toMatchObject(
      mockLayoutInfo,
    );
  });

  it('setSuggestionConfig', () => {
    const suggestionConfig = {
      suggest_reply_mode: SuggestReplyMode.WithCustomizedPrompt,
      customized_suggest_prompt: 'fake prompt',
    };

    useBotSkillStore.getState().setSuggestionConfig(suggestionConfig);

    expect(useBotSkillStore.getState().suggestionConfig).toMatchObject(
      suggestionConfig,
    );
  });

  it('setBackgroundImageInfoList', () => {
    const backgroundList: BackgroundImageInfo[] = [
      {
        web_background_image: {
          image_url: '',
          origin_image_uri: '',
          canvas_position: {
            left: 0,
            top: 2,
            width: 100,
            height: 100,
          },
        },
      },
    ];
    useBotSkillStore.getState().setBackgroundImageInfoList(backgroundList);
    expect(useBotSkillStore.getState().backgroundImageInfoList).toMatchObject(
      backgroundList,
    );
  });

  it('setDefaultUserInputType', () => {
    const { setDefaultUserInputType } = useBotSkillStore.getState();
    setDefaultUserInputType(DefaultUserInputType.Voice);
    expect(useBotSkillStore.getState().voicesInfo.defaultUserInputType).toEqual(
      DefaultUserInputType.Voice,
    );
  });

  it('initializes store correctly with complete bot data', () => {
    const botData = {
      bot_info: {
        plugin_info_list: [],
        workflow_info_list: [],
        knowledge: {},
        task_info: {},
        variable_list: [],
        bot_tag_info: { time_capsule_info: {} },
        filebox_info: {},
        onboarding_info: {},
        suggest_reply_info: {},
        voices_info: {},
        background_image_info_list: [],
        shortcut_sort: [],
        hook_info: {},
        layout_info: {},
      },
      bot_option_data: {
        plugin_detail_map: {},
        plugin_api_detail_map: {},
        workflow_detail_map: {},
        knowledge_detail_map: {},
        shortcut_command_list: [],
      },
    };
    useBotSkillStore.getState().initStore(botData);
    const state = useBotSkillStore.getState();
    const defaultState = getDefaultBotSkillStore();
    expect(state.pluginApis).toEqual([]);
    expect(state.workflows).toEqual([]);
    expect(state.knowledge).toEqual({
      dataSetInfo: {
        auto: false,
        min_score: 0,
        no_recall_reply_customize_prompt: undefined,
        no_recall_reply_mode: undefined,
        search_strategy: undefined,
        show_source: undefined,
        show_source_mode: undefined,
        top_k: 0,
      },
      dataSetList: [],
    });
    expect(state.taskInfo).toEqual(defaultState.taskInfo);
    expect(state.variables).toEqual(defaultState.variables);
    expect(state.databaseList).toEqual(defaultState.databaseList);
    expect(state.timeCapsule).toEqual(defaultState.timeCapsule);
    expect(state.filebox).toEqual(defaultState.filebox);
    expect(state.onboardingContent).toEqual(defaultState.onboardingContent);
    expect(state.suggestionConfig).toEqual(defaultState.suggestionConfig);
    expect(state.tts).toEqual(defaultState.tts);
    expect(state.backgroundImageInfoList).toEqual(
      defaultState.backgroundImageInfoList,
    );
    expect(state.shortcut).toEqual(defaultState.shortcut);
    expect(state.devHooks).toEqual(defaultState.devHooks);
    expect(state.layoutInfo).toEqual(defaultState.layoutInfo);
  });
});
