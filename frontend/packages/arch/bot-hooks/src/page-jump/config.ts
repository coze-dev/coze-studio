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
 * Workflow pop-up window opening mode, not passed by default, or only added once
 */
export enum OpenModeType {
  OnlyOnceAdd = 'only_once_add',
}
/**
 * Record the selected status of the workflow pop-up window
 */
export interface WorkflowModalState {
  /**
   * @deprecated whether the published status
   */
  status?: WorkFlowListStatus;
  /**
   * @Deprecated The type selected in the menu bar on the left. Note that this type is translated by the front end and is not the same as the type in the interface request parameter.
   */
  type?: number | string;
  /**
   * Popup status JSON string
   */
  statusStr?: string;
}

// #Region ---------------------- Step 1. Declare the scene enumeration, if it involves a new page, also declare the page enumeration ----------------------
// (After adding the page or scene enumeration, there will be multiple ts errors in the entire file, which is expected. Just follow the step guidelines to improve the configuration step by step)

/**
 * The target page enumeration is used to aggregate [scene (scene) ], which is convenient for narrowing the current scene according to the page
 *
 * To jump from page A to page B, just define the page enumeration of B.
 *
 *
 * - Q: Why not use the default self-increasing enum value, it's troublesome to handwrite the name twice for each page
 * - A: It is easy to see the meaning directly when debugging, and there is no need to check the code for comparison. The following is the same
 */
export const enum PageType {
  BOT = 'bot',
  WORKFLOW = 'workflow',
  PLUGIN_MOCK_DATA = 'plugin_mock_data',
  KNOWLEDGE = 'knowledge',
  SOCIAL_SCENE = 'social_scene',
  DOUYIN_BOT = 'douyin_bot',
}

/* eslint-disable @typescript-eslint/naming-convention -- it is necessary to disable, this scenario requires a different enum naming convention */
/**
 * Unique enumeration for each jump scenario
 *
 * E.g. For example, bot editing page creation workflow is a scene, viewing workflow is a scene
 *
 * Enumeration definition specification:
 * 1. The most common scenario: two pages simple jump can be named according to the format of "{source page} __TO__ {target page}".
 *  (Note that there are two underscores before and after TO to distinguish scenes with multiple words on the page, such as BOT_LIST__TO__BOT_DETAIL, which will not be repeated later)
 * 2. There may be multiple scenarios for jumping to the target page from the source page, so you can name it in the format of '{source page} __ {behavior} __ {target page}'.
 * 3. If the target page logic is very simple and there are multiple jump sources, you can name it in the format of TO__ {target page}.
 * 4. For the specialization logic of "jump to the target page and then return", you can add "__ {suffix}" to the existing scene name, such as BOT__CREATE__WORKFLOW__BACK
 *
 * - Q: I think it's no problem for a target page to use the format of 'TO__ {target page} 'without thinking. I can complete everything in the parameters (param) and response value (response) of the business logic and source judgment
 * - A: Indeed, a target page can go all over the world by declaring only one scene, and here is just a paradigm for refining and splitting scenes step by step.
 *      From "TO__ {target page}" to "{source page} __TO__ {target page}" and then to "{source page} __ {behavior} __ {target page}" scenarios are increasingly segmented, business parties can decide how to use
 */
export const enum SceneType {
  /** Bot details page View workflow */
  BOT__VIEW__WORKFLOW = 'botViewWorkflow',
  /** View the workflow on the bot details page, or create a new workflow but not published, click Return */
  WORKFLOW__BACK__BOT = 'workflowBackBot',
  /** The bot details page creates a workflow and returns it after the workflow is published */
  WORKFLOW_PUBLISHED__BACK__BOT = 'workflowPublishedBackBot',

  /** Douyin bot details view workflow */
  DOUYIN_BOT__VIEW__WORKFLOW = 'douyinBotViewWorkflow',

  /** Douyin bot details page Back */
  WORKFLOW__BACK__DOUYIN_BOT = 'workflowBackDouyinBot',

  /** Douyin bot details page back after release */
  WORKFLOW_PUBLISHED__BACK__DOUYIN_BOT = 'workflowPulishedBackDouyinBot',

  /** Bot details page Enter the mock data page */
  BOT__TO__PLUGIN_MOCK_DATA = 'botToPluginMockData',
  /** Workflow details page Enter the mock data page */
  WORKFLOW__TO__PLUGIN_MOCK_DATA = 'workflowToPluginMockData',
  /** Mock set page Enter the mock data page */
  PLUGIN_MOCK_SET__TO__PLUGIN_MOCK_DATA = 'pluginMockSetToPluginMockData',
  /** Bot details page Enter the knowledge page */
  BOT__VIEW__KNOWLEDGE = 'botViewKnowledge',
  /** Knowledge page Click Exit to return to bot details page (not clicked Add) */
  KNOWLEDGE__BACK__BOT = 'knowledgeBackBot',
  /** Knowledge page Click to return to bot details page and add to bot */
  KNOWLEDGE__ADD_TO__BOT = 'knowledgeAddToBot',
  /** Bot List Page Go to the bot details page and view the release results  */
  BOT_LIST__VIEW_PUBLISH_RESULT_IN__BOT_DETAIL = 'botListViewPublishResultInBotDetail',
  /** Bot List Page Go to the bot details page and view the release results  */
  BOT_LIST__VIEW_PUBLISH_RESULT_IN__DOUYIN_DETAIL = 'botListViewPublishResultInDouyinDetail',
  /** Social scene page View workflow */
  SOCIAL_SCENE__VIEW__WORKFLOW = 'socialSceneViewWorkflow',
  /** View the workflow on the social scene details page, or create a new workflow but not published, click Return */
  WORKFLOW__BACK__SOCIAL_SCENE = 'workflowBackSocialScene',
  /** Create or view a workflow on the social scene details page, and return after the workflow is published */
  WORKFLOW_PUBLISHED__BACK__SOCIAL_SCENE = 'workflowPublishedBackSocialScene',
}
/* eslint-enable @typescript-eslint/naming-convention -- restore enum naming convention */

// #endregion

// #Region ---------------------- Step 2. Bind the declared scene enumeration to the page ----------------------

/** Bind the scenes that a page may contain */
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

// #Region ---------------------- Step 3. Declare the parameter types for the new scene ----------------------
// [Parameter (param) ] represents the data that needs to be filled in on page A when jumping from page A to page B. This data will be passed as route state
// (Page B will retrieve the processed data, which is called the response value.)

interface BotViewWorkflow {
  spaceID: string;
  workflowID: string;
  botID?: string;
  workflowModalState?: WorkflowModalState;
  /** This will be available in multi mode */
  agentID?: string;
  /** @Deprecated workflow pop-up open mode, default and can only be added once */
  workflowOpenMode?: OpenModeType;
  flowMode?: WorkflowMode;
  /** Whether to open in a new window */
  newWindow?: boolean;
  /** Optional workflow node ID */
  workflowNodeID?: string;
  /** Optional workflow version */
  workflowVersion?: string;
  /** Optional Execution ID */
  executeID?: string;
  /** Optional subprocess execution ID */
  subExecuteID?: string;
}

interface WorkflowBackBot {
  spaceID: string;
  botID: string;
  workflowModalState?: WorkflowModalState;
  /** This will be available in multi mode */
  agentID?: string;
  /** Workflow pop-up open mode, default and can only be added once */
  workflowOpenMode?: OpenModeType;
  flowMode?: WorkflowMode;
}

interface WorkflowPulishedBackBot {
  spaceID: string;
  botID: string;
  workflowID: string;
  pluginID: string;
  /** This will be available in multi mode */
  agentID?: string;
  /** Workflow pop-up open mode, default and can only be added once */
  workflowOpenMode?: OpenModeType;
  flowMode?: WorkflowMode;
}

/** Parameter types for the binding scenario */
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
    /** Whether to open in a new window */
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

// #Region ---------------------- Step 4. Configure the response value of the new scene ----------------------
// [Response value (response) ] represents the data obtained by page B when jumping from page A to page B
// Q: Why can't the B page directly get the parameters (param), and it has to be converted?
// A: 1. route state cannot be passed, cannot be stringified parameters, such as functions;
//    2. Static configuration (response) and dynamic configuration (param) are separated to simplify business calls.

// If this part of the configuration continues to expand in the future and the file is too long, you can consider further splitting the file

/** Bind the response value of the scene */
export const SCENE_RESPONSE_MAP = {
  // Temporarily fixed type derivation problem, delete here when the second parameter jump is required in a scene _
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
    url: `/space/${params.spaceID}/${
      params.mode === 'bot' ? 'bot' : 'douyin-bot'
    }/${params.botID}`,
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

// #Region ---------------------- part that business parties don't need to pay attention to ----------------------

/**
 * auxiliary type
 *
 * This type implements the following things:
 * 1. Check whether SceneType is traversed. If there is any omission, an error will be reported.
 * 2. Inject parameter types for callback methods
 * 3. Constraint The response value must contain certain fields (such as url), otherwise an error will be reported
 * 4. Correctly derive the specific type of the response value for subsequent use
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
