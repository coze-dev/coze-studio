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
  type WorkflowMode,
  type WorkFlowListStatus,
} from '@coze-arch/bot-api/workflow_api';

import type { PageJumpExecFunc } from '.';

/**
 * workflow 弹窗打开模式，默认不传，或仅添加一次
 */
export enum OpenModeType {
  OnlyOnceAdd = 'only_once_add',
}
/**
 * 记录 workflow 弹窗的选中状态
 */
export interface WorkflowModalState {
  /**
   * @deprecated 是否已发布的状态
   */
  status?: WorkFlowListStatus;
  /**
   * @deprecated 左边菜单栏选中的类型，注意这个 type 是前端翻译过的，与接口请求参数里的 type 不是同一个
   */
  type?: number | string;
  /**
   * 弹窗状态 JSON 字符串
   */
  statusStr?: string;
}

// #region ---------------------- step 1. 声明场景枚举，若涉及新页面则也声明一下页面枚举 ----------------------
// （添加了页面或场景枚举后，整个文件会有多处 ts 报错，这是预期内的。根据 step 指引一步一步完善配置即可）

/**
 * 目标页面枚举，用于聚合【场景(scene)】，便于根据页面对当前场景做 narrowing
 *
 * e.g. 从 A 页跳转到 B 页，只需要定义 B 的页面枚举
 *
 *
 * - Q: 为什么不使用默认的自增 enum 数值，每个页面手写两遍名字好麻烦
 * - A: 便于调试时能直接看出含义，不用查代码对照，下同
 */
export const enum PageType {
  BOT = 'bot',
  WORKFLOW = 'workflow',
  PLUGIN_MOCK_DATA = 'plugin_mock_data',
  KNOWLEDGE = 'knowledge',
  SOCIAL_SCENE = 'social_scene',
  DOUYIN_BOT = 'douyin_bot',
}

/* eslint-disable @typescript-eslint/naming-convention -- 有必要 disable，该场景需要不同的 enum 命名规范 */
/**
 * 每种跳转场景的唯一枚举
 *
 * e.g. 比如 bot 编辑页创建 workflow 是一种场景，查看 workflow 是一种场景
 *
 * 枚举定义规范：
 * 1. 最常见的场景：两个页面简单跳转可以按 `{源页面}__TO__{目标页面}` 的格式命名。
 *  （注意 TO 前后各有两个下划线，以便区分页面名为多个单词的场景，比如 BOT_LIST__TO__BOT_DETAIL，后文不再赘述）
 * 2. 从源页面可能存在多种跳转到目标页面的场景，则可以按 `{源页面}__{行为}__{目标页面}` 格式命名。
 * 3. 如果目标页面逻辑很简单，又有多处跳转来源，则可以按 `TO__{目标页面}` 格式命名。
 * 4. 对于「跳转到目标页再返回」的特化逻辑，可以给已有的场景命名添加 `__{后缀}`，比如 BOT__CREATE__WORKFLOW__BACK
 *
 * - Q: 我觉得一个目标页面无脑使用 `TO__{目标页面}` 的格式就没问题啊，业务逻辑、来源判断什么我都可以在 参数(param) 和 响应值(response) 中完成
 * - A: 的确，一个目标页面只声明一种场景就可以打遍天下，这里只是提供了逐级细化拆分场景的范式。
 *      从 `TO__{目标页面}` 到 `{源页面}__TO__{目标页面}` 再到 `{源页面}__{行为}__{目标页面}` 场景是越来越细分的，业务方可以自行决定如何使用
 */
export const enum SceneType {
  /** bot 详情页查看 workflow */
  BOT__VIEW__WORKFLOW = 'botViewWorkflow',
  /** bot 详情页查看 workflow，或新建 workflow 但未发布，点击返回 */
  WORKFLOW__BACK__BOT = 'workflowBackBot',
  /** bot 详情页创建 workflow，在 workflow 发布后返回 */
  WORKFLOW_PUBLISHED__BACK__BOT = 'workflowPublishedBackBot',

  /** 抖音 bot 详情查看 workflow */
  DOUYIN_BOT__VIEW__WORKFLOW = 'douyinBotViewWorkflow',

  /** 抖音 bot 详情页返回 */
  WORKFLOW__BACK__DOUYIN_BOT = 'workflowBackDouyinBot',

  /** 抖音 bot 详情页发布后返回 */
  WORKFLOW_PUBLISHED__BACK__DOUYIN_BOT = 'workflowPulishedBackDouyinBot',

  /** bot 详情页进入 mock data 页面 */
  BOT__TO__PLUGIN_MOCK_DATA = 'botToPluginMockData',
  /** workflow 详情页进入 mock data 页面 */
  WORKFLOW__TO__PLUGIN_MOCK_DATA = 'workflowToPluginMockData',
  /** mock set 页进入 mock data 页面 */
  PLUGIN_MOCK_SET__TO__PLUGIN_MOCK_DATA = 'pluginMockSetToPluginMockData',
  /** bot 详情页进入 knowledge 页面 */
  BOT__VIEW__KNOWLEDGE = 'botViewKnowledge',
  /** knowledge 页面点击退出返回 bot 详情页（未点击添加） */
  KNOWLEDGE__BACK__BOT = 'knowledgeBackBot',
  /** knowledge 页面点击返回 bot 详情页，并添加到 bot */
  KNOWLEDGE__ADD_TO__BOT = 'knowledgeAddToBot',
  /** bot 列表页进入bot 详情页，并查看发布结果  */
  BOT_LIST__VIEW_PUBLISH_RESULT_IN__BOT_DETAIL = 'botListViewPublishResultInBotDetail',
  /** bot 列表页进入bot 详情页，并查看发布结果  */
  BOT_LIST__VIEW_PUBLISH_RESULT_IN__DOUYIN_DETAIL = 'botListViewPublishResultInDouyinDetail',
  /** social scene 页面查看 workflow */
  SOCIAL_SCENE__VIEW__WORKFLOW = 'socialSceneViewWorkflow',
  /** social scene  详情页查看 workflow，或新建 workflow 但未发布，点击返回 */
  WORKFLOW__BACK__SOCIAL_SCENE = 'workflowBackSocialScene',
  /** social scene 详情页创建或查看 workflow，在 workflow 发布后返回 */
  WORKFLOW_PUBLISHED__BACK__SOCIAL_SCENE = 'workflowPublishedBackSocialScene',
}
/* eslint-enable @typescript-eslint/naming-convention -- 恢复 enum 命名规范 */

// #endregion

// #region ---------------------- step 2. 将声明的场景枚举绑定至页面 ----------------------

/** 绑定某一页面可能包含的场景 */
export const PAGE_SCENE_MAP = {
  [PageType.WORKFLOW]: [
    SceneType.BOT__VIEW__WORKFLOW,
    SceneType.SOCIAL_SCENE__VIEW__WORKFLOW,
    SceneType.DOUYIN_BOT__VIEW__WORKFLOW,
  ],
  [PageType.BOT]: [
    SceneType.WORKFLOW__BACK__BOT,
    SceneType.WORKFLOW_PUBLISHED__BACK__BOT,
    SceneType.KNOWLEDGE__BACK__BOT,
    SceneType.KNOWLEDGE__ADD_TO__BOT,
    SceneType.BOT_LIST__VIEW_PUBLISH_RESULT_IN__BOT_DETAIL,
  ],
  [PageType.DOUYIN_BOT]: [
    SceneType.WORKFLOW__BACK__DOUYIN_BOT,
    SceneType.WORKFLOW_PUBLISHED__BACK__DOUYIN_BOT,
    SceneType.BOT_LIST__VIEW_PUBLISH_RESULT_IN__DOUYIN_DETAIL,
  ],
  [PageType.PLUGIN_MOCK_DATA]: [
    SceneType.BOT__TO__PLUGIN_MOCK_DATA,
    SceneType.WORKFLOW__TO__PLUGIN_MOCK_DATA,
    SceneType.PLUGIN_MOCK_SET__TO__PLUGIN_MOCK_DATA,
  ],
  [PageType.KNOWLEDGE]: [SceneType.BOT__VIEW__KNOWLEDGE],
  [PageType.SOCIAL_SCENE]: [
    SceneType.WORKFLOW__BACK__SOCIAL_SCENE,
    SceneType.WORKFLOW_PUBLISHED__BACK__SOCIAL_SCENE,
  ],
} satisfies Record<PageType, SceneType[]>;

// #endregion

// #region ---------------------- step 3. 声明新场景的参数类型 ----------------------
// 【参数(param)】表示从 A 页面跳转 B 页面时，需要 A 页面填写的数据。这份数据会作为 route state 传递
// （B 页面会取得处理后的数据，称为响应值）

interface BotViewWorkflow {
  spaceID: string;
  workflowID: string;
  botID?: string;
  workflowModalState?: WorkflowModalState;
  /** multi 模式下会有此项 */
  agentID?: string;
  /** @deprecated workflow弹窗打开模式，默认和仅可添加一次 */
  workflowOpenMode?: OpenModeType;
  flowMode?: WorkflowMode;
  /** 是否在新窗口打开 */
  newWindow?: boolean;
  /** 可选的工作流节点 ID */
  workflowNodeID?: string;
  /** 可选的工作流版本 */
  workflowVersion?: string;
  /** 可选的执行 ID */
  executeID?: string;
  /** 可选的子流程执行 ID */
  subExecuteID?: string;
}

interface WorkflowBackBot {
  spaceID: string;
  botID: string;
  workflowModalState?: WorkflowModalState;
  /** multi 模式下会有此项 */
  agentID?: string;
  /** workflow弹窗打开模式，默认和仅可添加一次 */
  workflowOpenMode?: OpenModeType;
  flowMode?: WorkflowMode;
}

interface WorkflowPulishedBackBot {
  spaceID: string;
  botID: string;
  workflowID: string;
  pluginID: string;
  /** multi 模式下会有此项 */
  agentID?: string;
  /** workflow弹窗打开模式，默认和仅可添加一次 */
  workflowOpenMode?: OpenModeType;
  flowMode?: WorkflowMode;
}

/** 绑定场景的参数类型 */
export type SceneParamTypeMap<T extends SceneType> = {
  [SceneType.BOT__VIEW__WORKFLOW]: BotViewWorkflow;
  [SceneType.DOUYIN_BOT__VIEW__WORKFLOW]: BotViewWorkflow;
  [SceneType.WORKFLOW__BACK__BOT]: WorkflowBackBot;
  [SceneType.WORKFLOW__BACK__DOUYIN_BOT]: WorkflowBackBot;
  [SceneType.WORKFLOW_PUBLISHED__BACK__BOT]: WorkflowPulishedBackBot;
  [SceneType.WORKFLOW_PUBLISHED__BACK__DOUYIN_BOT]: WorkflowPulishedBackBot;
  [SceneType.BOT__TO__PLUGIN_MOCK_DATA]: {
    spaceId: string;
    pluginId: string;
    pluginName?: string;
    toolId: string;
    toolName?: string;
    mockSetId: string;
    mockSetName?: string;
    generationMode?: number;
    bizCtx: string;
    bindSubjectInfo: string;
  };
  [SceneType.WORKFLOW__TO__PLUGIN_MOCK_DATA]: {
    spaceId: string;
    pluginId: string;
    pluginName?: string;
    toolId: string;
    toolName?: string;
    mockSetId: string;
    mockSetName?: string;
    generationMode?: number;
    bizCtx: string;
    bindSubjectInfo: string;
  };
  [SceneType.PLUGIN_MOCK_SET__TO__PLUGIN_MOCK_DATA]: {
    spaceId: string;
    pluginId: string;
    pluginName?: string;
    toolId: string;
    toolName?: string;
    mockSetId: string;
    mockSetName?: string;
    generationMode?: number;
    bizCtx?: string;
    bindSubjectInfo?: string;
  };
  [SceneType.BOT__VIEW__KNOWLEDGE]: {
    spaceID?: string;
    botID?: string;
    knowledgeID?: string;
  };
  [SceneType.KNOWLEDGE__BACK__BOT]: {
    spaceID?: string;
    botID?: string;
    mode: 'bot' | 'douyin';
  };
  [SceneType.KNOWLEDGE__ADD_TO__BOT]: {
    spaceID?: string;
    botID?: string;
    knowledgeID?: string;
  };
  [SceneType.BOT_LIST__VIEW_PUBLISH_RESULT_IN__BOT_DETAIL]: {
    publishId: string;
    commitVersion: string;
    spaceId: string;
    botId: string;
  };
  [SceneType.BOT_LIST__VIEW_PUBLISH_RESULT_IN__DOUYIN_DETAIL]: {
    publishId: string;
    commitVersion: string;
    spaceId: string;
    botId: string;
  };
  [SceneType.SOCIAL_SCENE__VIEW__WORKFLOW]: {
    spaceID: string;
    workflowID: string;
    sceneID: string;
    workflowModalState?: WorkflowModalState;
    flowMode?: WorkflowMode;
    /** 是否在新窗口打开 */
    newWindow?: boolean;
  };
  [SceneType.WORKFLOW__BACK__SOCIAL_SCENE]: {
    spaceID: string;
    sceneID: string;
    workflowModalState?: WorkflowModalState;
    flowMode?: WorkflowMode;
  };
  [SceneType.WORKFLOW_PUBLISHED__BACK__SOCIAL_SCENE]: {
    spaceID: string;
    workflowID: string;
    sceneID: string;
    pluginID: string;
    flowMode?: WorkflowMode;
  };
}[T];

// #endregion

// #region ---------------------- step 4. 配置新场景的响应值 ----------------------
// 【响应值(response)】表示从 A 页面跳转 B 页面时，B 页面获取的数据
// Q: 为什么 B 页面不能直接拿到 参数(param)，还得转换一下？
// A: 1. route state 无法传递 不能 stringify 的参数，比如函数；
//    2. 静态配置（response）和动态配置（param）分离，简化业务调用。

// 若未来这部分配置不断膨胀导致文件过长，则可以考虑进一步拆分文件

/** 绑定场景的响应值 */
export const SCENE_RESPONSE_MAP = {
  // 临时修正类型推导问题，待有场景需要第二个参数 jump 时删掉此处 _
  [SceneType.BOT__VIEW__WORKFLOW]: (params, _) => {
    let url = `/work_flow?space_id=${params.spaceID}&workflow_id=${params.workflowID}`;

    const queries = [
      ['bot_id', params.botID],
      ['node_id', params.workflowNodeID],
      ['version', params.workflowVersion],
      ['execute_id', params.executeID],
      ['sub_execute_id', params.subExecuteID],
    ];

    queries.forEach(([key, value]) => {
      if (value && value.length > 0) {
        url += `&${key}=${value}`;
      }
    });

    return {
      url,
      botID: params.botID,
      workflowModalState: params.workflowModalState,
      agentID: params.agentID,
      workflowOpenMode: params.workflowOpenMode,
      flowMode: params.flowMode,
    };
  },
  [SceneType.DOUYIN_BOT__VIEW__WORKFLOW]: (params, _) => {
    let url = `/work_flow?space_id=${params.spaceID}&workflow_id=${params.workflowID}`;

    const queries = [
      ['bot_id', params.botID],
      ['node_id', params.workflowNodeID],
      ['version', params.workflowVersion],
      ['execute_id', params.executeID],
      ['sub_execute_id', params.subExecuteID],
    ];

    queries.forEach(([key, value]) => {
      if (value && value.length > 0) {
        url += `&${key}=${value}`;
      }
    });

    return {
      url,
      botID: params.botID,
      workflowModalState: params.workflowModalState,
      agentID: params.agentID,
      workflowOpenMode: params.workflowOpenMode,
      flowMode: params.flowMode,
    };
  },
  [SceneType.WORKFLOW__BACK__BOT]: params => ({
    url: `/space/${params.spaceID}/bot/${params.botID}`,
    workflowModalState: params.workflowModalState,
    agentID: params.agentID,
    workflowOpenMode: params.workflowOpenMode,
    flowMode: params.flowMode,
  }),
  [SceneType.WORKFLOW__BACK__DOUYIN_BOT]: params => ({
    url: `/space/${params.spaceID}/douyin-bot/${params.botID}`,
    workflowModalState: params.workflowModalState,
    agentID: params.agentID,
    workflowOpenMode: params.workflowOpenMode,
    flowMode: params.flowMode,
  }),
  [SceneType.WORKFLOW_PUBLISHED__BACK__BOT]: params => ({
    url: `/space/${params.spaceID}/bot/${params.botID}`,
    workflowID: params.workflowID,
    pluginID: params.pluginID,
    agentID: params.agentID,
    workflowOpenMode: params.workflowOpenMode,
    flowMode: params.flowMode,
  }),
  [SceneType.WORKFLOW_PUBLISHED__BACK__DOUYIN_BOT]: params => ({
    url: `/space/${params.spaceID}/douyin-bot/${params.botID}`,
    workflowID: params.workflowID,
    pluginID: params.pluginID,
    agentID: params.agentID,
    workflowOpenMode: params.workflowOpenMode,
    flowMode: params.flowMode,
  }),
  [SceneType.BOT__TO__PLUGIN_MOCK_DATA]: params => {
    const { spaceId, pluginId, toolId, mockSetId } = params;
    return {
      url: `/space/${spaceId}/plugin/${pluginId}/tool/${toolId}/plugin-mock-set/${mockSetId}?hideMenu=true`,
      fromSource: 'bot',
      ...params,
    };
  },
  [SceneType.WORKFLOW__TO__PLUGIN_MOCK_DATA]: params => {
    const { spaceId, pluginId, toolId, mockSetId } = params;
    return {
      url: `/space/${spaceId}/plugin/${pluginId}/tool/${toolId}/plugin-mock-set/${mockSetId}?hideMenu=true&workflowPluginMockset=true`,
      fromSource: 'workflow',
      ...params,
    };
  },
  [SceneType.PLUGIN_MOCK_SET__TO__PLUGIN_MOCK_DATA]: params => {
    const { spaceId, pluginId, toolId, mockSetId } = params;
    return {
      url: `/space/${spaceId}/plugin/${pluginId}/tool/${toolId}/plugin-mock-set/${mockSetId}`,
      fromSource: 'mock_set',
      back: undefined,
      ...params,
    };
  },
  [SceneType.BOT__VIEW__KNOWLEDGE]: params => ({
    url: `/space/${params.spaceID}/knowledge/${params.knowledgeID}?page_mode=modal&from=bot&bot_id=${params.botID}`,
    botID: params.botID,
  }),
  [SceneType.KNOWLEDGE__BACK__BOT]: params => ({
    url: `/space/${params.spaceID}/${params.mode === 'bot' ? 'bot' : 'douyin-bot'}/${params.botID}`,
  }),
  [SceneType.KNOWLEDGE__ADD_TO__BOT]: params => ({
    url: `/space/${params.spaceID}/bot/${params.botID}`,
    knowledgeID: params.knowledgeID,
  }),
  [SceneType.BOT_LIST__VIEW_PUBLISH_RESULT_IN__BOT_DETAIL]: params => ({
    url: `/space/${params.spaceId}/bot/${params.botId}`,
    publishId: params.publishId,
    commitVersion: params.commitVersion,
  }),
  [SceneType.BOT_LIST__VIEW_PUBLISH_RESULT_IN__DOUYIN_DETAIL]: params => ({
    url: `/space/${params.spaceId}/douyin-bot/${params.botId}`,
    publishId: params.publishId,
    commitVersion: params.commitVersion,
  }),
  [SceneType.SOCIAL_SCENE__VIEW__WORKFLOW]: (params, _) => ({
    url: `/work_flow?scene_id=${params.sceneID}&space_id=${params.spaceID}&workflow_id=${params.workflowID}`,
    sceneID: params.sceneID,
    workflowModalState: params.workflowModalState,
    flowMode: params.flowMode,
  }),
  [SceneType.WORKFLOW_PUBLISHED__BACK__SOCIAL_SCENE]: (params, _) => ({
    url: `/space/${params.spaceID}/social-scene/${params.sceneID}`,
    workflowID: params.workflowID,
    pluginID: params.pluginID,
    flowMode: params.flowMode,
  }),
  [SceneType.WORKFLOW__BACK__SOCIAL_SCENE]: params => ({
    url: `/space/${params.spaceID}/social-scene/${params.sceneID}`,
    workflowModalState: params.workflowModalState,
    flowMode: params.flowMode,
  }),
} satisfies SceneResponseConstraint;

// #endregion

// #region ---------------------- 业务方无需关注的部分 ----------------------

/**
 * 辅助类型
 *
 * 该类型实现以下几件事：
 * 1. 检查 SceneType 是否被遍历，有遗漏则会报错
 * 2. 为回调方法注入参数类型
 * 3. 约束响应值必须包含某些字段（比如 url），否则报错
 * 4. 正确推导响应值的具体类型，便于后续使用
 */
type SceneResponseConstraint = {
  [K in SceneType]: (
    param: SceneParamTypeMap<K>,
    jump: PageJumpExecFunc,
  ) => {
    url: string;
  };
};

// #endregion
