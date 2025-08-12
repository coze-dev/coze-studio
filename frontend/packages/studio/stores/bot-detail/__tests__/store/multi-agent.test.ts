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

import { type Mock } from 'vitest';
import { type GetDraftBotInfoAgwData } from '@coze-arch/idl/playground_api';
import { SpaceApiV2 } from '@coze-arch/bot-space-api';
import {
  AgentType,
  MultiAgentSessionType,
  type PluginApi,
  SuggestReplyMode,
  BotMode,
} from '@coze-arch/bot-api/developer_api';
import { LineType } from '@flowgram-adapter/free-layout-editor';

// eslint-disable-next-line @coze-arch/no-batch-import-or-export
import * as findAgentModule from '../../src/utils/find-agent';
import { useMultiAgentStore } from '../../src/store/multi-agent';
import { useBotDetailStoreSet } from '../../src/store/index';
import {
  getDefaultCollaborationStore,
  useCollaborationStore,
} from '../../src/store/collaboration';
import {
  getDefaultBotInfoStore,
  useBotInfoStore,
} from '../../src/store/bot-info';
import {
  type BotMultiAgent,
  type Agent,
  type KnowledgeConfig,
} from '../../src';
const startAgent: Agent = {
  id: 'fake start agent id',
  agent_type: AgentType.Start_Agent,
  prompt: 'fake prompt',
  model: { model: 'fake model' },
  skills: {
    devHooks: {},
    pluginApis: [],
    workflows: [],
    knowledge: {
      dataSetList: [],
      dataSetInfo: {
        min_score: 666,
        top_k: 666,
        auto: true,
      },
    },
  },
  suggestion: {
    suggest_reply_mode: SuggestReplyMode.WithDefaultPrompt,
    customized_suggest_prompt: '',
  },
  system_info_all: [],
  bizInfo: { focused: true },
  jump_config: {},
};
const normalAgent1: Agent = {
  id: 'fake agent id 1',
  prompt: 'fake prompt',
  model: { model: 'fake model' },
  skills: {
    devHooks: {},
    pluginApis: [
      {
        api_id: 'fake plugin api ID 1',
      },
      {
        api_id: 'fake plugin api ID 2',
      },
    ],
    workflows: [
      {
        workflow_id: 'fake workflow ID 1',
        plugin_id: 'fake plugin ID',
        name: 'fake workflow name',
        desc: 'fake workflow desc',
        parameters: [],
        plugin_icon: 'fake plugin icon',
      },
      {
        workflow_id: 'fake workflow ID 2',
        plugin_id: 'fake plugin ID',
        name: 'fake workflow name',
        desc: 'fake workflow desc',
        parameters: [],
        plugin_icon: 'fake plugin icon',
      },
    ],
    knowledge: {
      dataSetList: [
        { dataset_id: 'fake knowledge ID 1' },
        { dataset_id: 'fake knowledge ID 2' },
      ],
      dataSetInfo: {
        min_score: 666,
        top_k: 666,
        auto: true,
      },
    },
  },
  suggestion: {
    suggest_reply_mode: SuggestReplyMode.WithDefaultPrompt,
    customized_suggest_prompt: '',
  },
  system_info_all: [],
  bizInfo: { focused: true },
  intents: [{ intent_id: 'fake intent ID' }],
  jump_config: {},
};
const normalAgent2: Agent = {
  id: 'fake agent id 2',
  prompt: 'fake prompt',
  model: { model: 'fake model' },
  reference_id: 'fake reference id 1',
  skills: {
    devHooks: {},
    pluginApis: [],
    workflows: [],
    knowledge: {
      dataSetList: [],
      dataSetInfo: {
        min_score: 666,
        top_k: 666,
        auto: true,
      },
    },
  },
  suggestion: {
    suggest_reply_mode: SuggestReplyMode.WithDefaultPrompt,
    customized_suggest_prompt: '',
  },
  system_info_all: [],
  bizInfo: { focused: true },
  jump_config: {},
};
const edge1 = {
  sourceNodeID: 'fake start agent id',
  targetNodeID: 'fake agent id 1',
};
const edge2 = {
  sourceNodeID: 'fake agent id 1',
  targetNodeID: 'fake agent id 2',
};

vi.mock('@coze-arch/bot-space-api', () => ({
  SpaceApiV2: {
    MGetBotByVersion: vi.fn(),
  },
}));

describe('useMultiAgentStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
    vi.clearAllMocks();
  });
  it('setMultiSheetViewOpen', () => {
    const multiSheetViewOpen = { left: false, right: true };

    useMultiAgentStore.getState().setMultiSheetViewOpen(multiSheetViewOpen);

    expect(useMultiAgentStore.getState().multiSheetViewOpen).toMatchObject(
      multiSheetViewOpen,
    );
  });

  it('setMultiAgent', () => {
    const multiAgent: Partial<BotMultiAgent> = {
      agents: [
        {
          id: '233',
          prompt: 'fake prompt',
          model: { model: 'fake model' },
          skills: {
            pluginApis: [],
            workflows: [],
            devHooks: {},
            knowledge: {
              dataSetList: [],
              dataSetInfo: {
                min_score: 666,
                top_k: 666,
                auto: true,
              },
            },
          },
          suggestion: {
            suggest_reply_mode: SuggestReplyMode.WithDefaultPrompt,
            customized_suggest_prompt: '',
          },
          system_info_all: [],
          bizInfo: { focused: true },
          jump_config: {},
        },
      ],
      edges: [
        {
          sourceNodeID: 'fake source node ID',
          targetNodeID: 'fake target node ID',
        },
      ],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgent(multiAgent);

    expect(useMultiAgentStore.getState()).toMatchObject(multiAgent);
  });

  it('setMultiAgentByImmer', () => {
    const multiAgent = {
      agents: [
        {
          id: '233',
          prompt: 'fake prompt',
          model: { model: 'fake model' },
          skills: {
            pluginApis: [],
            workflows: [],
            knowledge: {
              dataSetList: [],
              dataSetInfo: {
                min_score: 666,
                top_k: 666,
                auto: true,
              },
            },
          },
          suggestion: {
            suggest_reply_mode: SuggestReplyMode.WithDefaultPrompt,
            customized_suggest_prompt: '',
          },
          system_info_all: [],
          bizInfo: { focused: true },
          jump_config: {},
        },
      ],
      edges: [
        {
          sourceNodeID: 'fake source node ID',
          targetNodeID: 'fake target node ID',
        },
      ],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgentByImmer(state => {
      state.agents = multiAgent.agents;
      state.edges = multiAgent.edges;
      state.connector_type = multiAgent.connector_type;
      state.botAgentInfos = multiAgent.botAgentInfos;
    });

    expect(useMultiAgentStore.getState()).toMatchObject(multiAgent);
  });
  it('updateAgentSkillKnowledgeDatasetInfo', () => {
    const mockAgentId = startAgent.id;
    const mockDatasetInfo: KnowledgeConfig['dataSetInfo'] = {
      min_score: 1,
      search_strategy: 2,
      top_k: 2,
      auto: true,
    };

    const suitableMultiAgent = {
      agents: [startAgent, normalAgent1],
      edges: [edge1],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgent(suitableMultiAgent);

    useMultiAgentStore
      .getState()
      .updateAgentSkillKnowledgeDatasetInfo(mockAgentId, mockDatasetInfo);
    expect(
      useMultiAgentStore.getState().agents[0].skills.knowledge.dataSetInfo,
    ).toMatchObject(mockDatasetInfo);
  });
  it('updateAgentSkillKnowledgeDatasetInfo', () => {
    const mockAgentId = startAgent.id;
    const mockDatasetInfo: KnowledgeConfig['dataSetInfo'] = {
      min_score: 1,
      search_strategy: 2,
      top_k: 2,
      auto: true,
    };

    const suitableMultiAgent = {
      agents: [startAgent, normalAgent1],
      edges: [edge1],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgent(suitableMultiAgent);

    useMultiAgentStore
      .getState()
      .updateAgentSkillKnowledgeDatasetInfo(mockAgentId, mockDatasetInfo);
    expect(
      useMultiAgentStore.getState().agents[0].skills.knowledge.dataSetInfo,
    ).toMatchObject(mockDatasetInfo);
  });
  it('updateAgentSkillPluginApis', () => {
    const mockAgentId = startAgent.id;
    const mockPlugins: PluginApi[] = [
      {
        name: 'plugin1',
        desc: 'plugin desc',
        parameters: [],
        plugin_id: 'id',
        plugin_name: 'name',
        api_id: 'id',
      },
    ];

    const suitableMultiAgent = {
      agents: [startAgent, normalAgent1],
      edges: [edge1],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgent(suitableMultiAgent);

    useMultiAgentStore
      .getState()
      .updateAgentSkillPluginApis(mockAgentId, mockPlugins);
    expect(
      useMultiAgentStore.getState().agents[0].skills.pluginApis,
    ).toMatchObject(mockPlugins);
  });
  it('removeAgentSkillItem', () => {
    const multiAgent = {
      agents: [startAgent, normalAgent1, normalAgent2],
      edges: [edge1, edge2],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgent(multiAgent);

    const target1 = normalAgent1.skills.pluginApis[1].api_id;

    useMultiAgentStore
      .getState()
      .removeAgentSkillItem(normalAgent1.id, 'pluginApis', target1);

    expect(
      useMultiAgentStore
        .getState()
        .agents[1].skills.pluginApis.find(item => item.api_id === target1),
    ).toBeUndefined();

    const target2 = normalAgent1.skills.workflows[1].workflow_id;

    useMultiAgentStore
      .getState()
      .removeAgentSkillItem(normalAgent1.id, 'workflows', target2);

    expect(
      useMultiAgentStore
        .getState()
        .agents[1].skills.workflows.find(item => item.workflow_id === target2),
    ).toBeUndefined();

    const target3 = normalAgent1.skills.knowledge.dataSetList[1].dataset_id;

    useMultiAgentStore
      .getState()
      .removeAgentSkillItem(normalAgent1.id, 'knowledge', target3);

    expect(
      useMultiAgentStore
        .getState()
        .agents[1].skills.knowledge.dataSetList.find(
          item => item.dataset_id === target3,
        ),
    ).toBeUndefined();

    const target4 = normalAgent1.skills.pluginApis[0].api_id;

    useMultiAgentStore
      .getState()
      // @ts-expect-error for UT
      .removeAgentSkillItem(normalAgent1.id, 'wrong type', target4);

    expect(
      useMultiAgentStore
        .getState()
        .agents[1].skills.pluginApis.find(item => item.api_id === target4),
    ).toBeDefined();
  });
  it('updatedCurrentAgentIdWithConnectStart', () => {
    const suitableMultiAgent = {
      agents: [startAgent, normalAgent1],
      edges: [edge1],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgent(suitableMultiAgent);

    useMultiAgentStore.getState().updatedCurrentAgentIdWithConnectStart();

    expect(useMultiAgentStore.getState().currentAgentID).toBe(
      suitableMultiAgent.agents[1].id,
    );
  });
  it('setAgentIntentNextID', () => {
    const multiAgent = {
      agents: [startAgent, normalAgent1, normalAgent2],
      edges: [edge1, edge2],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgent(multiAgent);

    useMultiAgentStore
      .getState()
      .setAgentIntentNextID(
        normalAgent1.id,
        normalAgent1.intents?.[0].intent_id,
        normalAgent2.id,
      );

    expect(
      useMultiAgentStore.getState()?.agents?.[1]?.intents?.[0].next_agent_id,
    ).toBe(normalAgent2.id);
  });

  it('clearIntentNextId', () => {
    const multiAgent = {
      agents: [startAgent, normalAgent1, normalAgent2],
      edges: [edge1, edge2],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgent(multiAgent);

    useMultiAgentStore
      .getState()
      .setAgentIntentNextID(
        normalAgent1.id,
        normalAgent1?.intents?.[0].intent_id,
        normalAgent2.id,
      );

    useMultiAgentStore
      .getState()
      .clearIntentNextId(
        normalAgent1.id,
        normalAgent2.id,
        normalAgent1?.intents?.[0].intent_id ?? '',
      );

    expect(
      useMultiAgentStore.getState()?.agents?.[1]?.intents?.[0]?.next_agent_id,
    ).toBeUndefined();

    useMultiAgentStore
      .getState()
      .setAgentIntentNextID(
        normalAgent1.id,
        normalAgent1.intents?.[0].intent_id,
        normalAgent2.id,
      );

    useMultiAgentStore
      .getState()
      .clearIntentNextId(
        normalAgent1.id,
        normalAgent2.id,
        `${normalAgent1.intents?.[0]?.intent_id}escape`,
      );

    expect(
      useMultiAgentStore.getState()?.agents[1]?.intents?.[0]?.next_agent_id,
    ).toBe(normalAgent2.id);
  });

  it('clearEdgesByTargetAgentId', () => {
    const multiAgent = {
      agents: [startAgent, normalAgent1, normalAgent2],
      edges: [edge1, edge2],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgent(multiAgent);

    useMultiAgentStore
      .getState()
      .setAgentIntentNextID(
        normalAgent1.id,
        normalAgent1.intents?.[0]?.intent_id,
        normalAgent2.id,
      );

    useMultiAgentStore
      .getState()
      .clearEdgesByTargetAgentId(`${normalAgent2.id}escape`);

    useMultiAgentStore.getState().agents[1].intents?.forEach(item => {
      expect(item.next_agent_id).toBeTruthy();
    });

    useMultiAgentStore.getState().clearEdgesByTargetAgentId(normalAgent2.id);

    useMultiAgentStore.getState().agents[1].intents?.forEach(item => {
      expect(item.next_agent_id).toBeUndefined();
    });
  });

  it('updateAgentSkillPluginApis', () => {
    const mockAgentId = startAgent.id;
    const mockPlugins: PluginApi[] = [
      {
        name: 'plugin1',
        desc: 'plugin desc',
        parameters: [],
        plugin_id: 'id',
        plugin_name: 'name',
        api_id: 'id',
      },
    ];

    const suitableMultiAgent = {
      agents: [startAgent, normalAgent1],
      edges: [edge1],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgent(suitableMultiAgent);

    useMultiAgentStore
      .getState()
      .updateAgentSkillPluginApis(mockAgentId, mockPlugins);
    expect(
      useMultiAgentStore.getState().agents[0].skills.pluginApis,
    ).toMatchObject(mockPlugins);
  });

  it('addAgent2Store', () => {
    const multiAgent = {
      agents: [startAgent, normalAgent1],
      edges: [edge1],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
      chatModeConfig: { type: MultiAgentSessionType.Flow, currentHostId: '' },
    };

    useMultiAgentStore.getState().setMultiAgent(multiAgent);

    const agentFromAPI = {
      agent_id: 'fake agent ID',
    };

    const agent = useMultiAgentStore.getState().addAgent2Store(agentFromAPI);

    expect(useMultiAgentStore.getState().agents.at(-1)).toBe(agent);

    expect(useMultiAgentStore.getState().agents.length).toBe(3);
    expect(useMultiAgentStore.getState().agents.at(-1)?.id).toBe(
      agentFromAPI.agent_id,
    );
  });
});
describe('resetHostAgent', () => {
  const chatModeConfigDefaultValue = {
    type: MultiAgentSessionType.Host,
    currentHostId: 'some-pre-value',
  };
  const agentsDefaultValue = [
    {
      id: 'mock_start_agent_id',
      agent_type: AgentType.Start_Agent,
      intents: [
        {
          intent_id: 'mock_intent_id',
          next_agent_id: 'mock_first_agent_id',
        },
      ],
    },
  ] as BotMultiAgent['agents'];
  const edgesDefaultValue = [
    {
      sourceNodeID: 'mock_start_agent_id',
      targetNodeID: 'mock_first_agent_id',
    },
  ] as unknown as BotMultiAgent['edges'];
  it('do nothing when first agent not found', () => {
    useMultiAgentStore.getState().setMultiAgent({
      agents: [],
      edges: [],
      chatModeConfig: chatModeConfigDefaultValue,
    });
    useMultiAgentStore.getState().resetHostAgent();
    expect(useMultiAgentStore.getState().chatModeConfig).toEqual(
      chatModeConfigDefaultValue,
    );
  });
  it('do nothing on Flow mode', () => {
    useMultiAgentStore.getState().setMultiAgent({
      agents: agentsDefaultValue,
      edges: edgesDefaultValue,
      chatModeConfig: {
        type: MultiAgentSessionType.Flow,
      },
    });
    useMultiAgentStore.getState().resetHostAgent();
    expect(useMultiAgentStore.getState().chatModeConfig).toEqual({
      type: MultiAgentSessionType.Flow,
    });
  });
  it('reset currentHostId to first agent id on host mode', () => {
    useMultiAgentStore.getState().setMultiAgent({
      agents: agentsDefaultValue,
      edges: edgesDefaultValue,
      chatModeConfig: chatModeConfigDefaultValue,
    });
    useMultiAgentStore.getState().resetHostAgent();
    expect(useMultiAgentStore.getState().chatModeConfig).toEqual({
      type: MultiAgentSessionType.Host,
      currentHostId: 'mock_first_agent_id',
    });
  });
  it('addAgent', async () => {
    const getOverall = vi
      .fn()
      .mockReturnValueOnce({
        botId: 'fake bot ID 1',
      })
      .mockReturnValueOnce({
        ...getDefaultBotInfoStore(),
        botId: 'fake bot ID 2',
      })
      .mockReturnValueOnce({
        botId: 'fake bot ID 1',
      })
      .mockReturnValueOnce({
        ...getDefaultBotInfoStore(),
        botId: 'fake bot ID 2',
      });

    useBotInfoStore.getState().setBotInfo(getOverall());
    // interface error return
    expect(await useMultiAgentStore.getState().addAgent({})).toBeUndefined();
    // Interface error return go default
    expect(useCollaborationStore.getState().sameWithOnline).toEqual(
      getDefaultCollaborationStore().sameWithOnline,
    );
    expect(useCollaborationStore.getState().branch).toEqual(
      getDefaultCollaborationStore().branch,
    );
    useBotDetailStoreSet.clear();

    expect(await useMultiAgentStore.getState().addAgent({})).toBeUndefined();
    expect(useCollaborationStore.getState().sameWithOnline).toEqual(
      getDefaultCollaborationStore().sameWithOnline,
    );
    expect(useCollaborationStore.getState().branch).toEqual(
      getDefaultCollaborationStore().branch,
    );

    useBotDetailStoreSet.clear();

    expect((await useMultiAgentStore.getState().addAgent({}))?.id).toEqual(
      useMultiAgentStore.getState().agents.at(-1)?.id,
    );
    expect(useCollaborationStore.getState().sameWithOnline).toBe(false);

    useMultiAgentStore.getState().clear();
    useBotInfoStore.getState().setBotInfo(getOverall());

    expect(await useMultiAgentStore.getState().addAgent({})).toBeUndefined();

    expect(useCollaborationStore.getState().sameWithOnline).toEqual(
      getDefaultCollaborationStore().sameWithOnline,
    );

    useBotDetailStoreSet.clear();

    expect(await useMultiAgentStore.getState().addAgent({})).toBeUndefined();
    expect(useCollaborationStore.getState().sameWithOnline).toEqual(
      getDefaultCollaborationStore().sameWithOnline,
    );

    useBotDetailStoreSet.clear();

    expect((await useMultiAgentStore.getState().addAgent({}))?.id).toEqual(
      useMultiAgentStore.getState().agents.at(-1)?.id,
    );
    expect(useCollaborationStore.getState().sameWithOnline).toBe(true);
    expect(useCollaborationStore.getState().branch).toEqual('fake branch');
  });

  it('batchAddBotAgent', async () => {
    const overall = {
      ...getDefaultBotInfoStore(),
      botId: 'fake bot ID 2',
    };

    useBotInfoStore.getState().setBotInfo(overall);

    const res0 = await useMultiAgentStore
      .getState()
      .batchAddBotAgent({ bots: [], positions: [] });
    expect(res0).toMatchObject([]);

    const res1 = await useMultiAgentStore
      .getState()
      .batchAddBotAgent({ bots: [], positions: [] });
    expect(res1).toMatchObject([]);
    useBotDetailStoreSet.clear();

    const multiAgent = {
      agents: [startAgent, normalAgent1],
      edges: [edge1],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
      chatModeConfig: { type: MultiAgentSessionType.Flow, currentHostId: '' },
    };

    useMultiAgentStore.getState().setMultiAgent(multiAgent);
    const res2 = await useMultiAgentStore
      .getState()
      .batchAddBotAgent({ bots: [], positions: [] });
    expect(useCollaborationStore.getState().sameWithOnline).toEqual(false);
    expect(useCollaborationStore.getState().branch).toEqual(2);

    expect(res2[0].name).toEqual('fake name');
    useBotDetailStoreSet.clear();
  });

  it('copyAgent', async () => {
    const getOverall = vi
      .fn()
      .mockReturnValueOnce({
        botId: 'fake bot ID 1',
      })
      .mockReturnValueOnce({
        botId: 'fake bot ID 2',
        botInfo: {},
      });

    useBotInfoStore.getState().setBotInfo(getOverall());

    expect(
      await useMultiAgentStore.getState().copyAgent('fake id'),
    ).toBeUndefined();
    expect(useCollaborationStore.getState().sameWithOnline).toEqual(
      getDefaultCollaborationStore().sameWithOnline,
    );

    useBotDetailStoreSet.clear();

    expect(
      await useMultiAgentStore.getState().copyAgent('fake id'),
    ).toBeUndefined();
    expect(useCollaborationStore.getState().sameWithOnline).toEqual(
      getDefaultCollaborationStore().sameWithOnline,
    );

    useBotDetailStoreSet.clear();
    useBotInfoStore.getState().setBotInfo(getOverall());

    expect(
      (await useMultiAgentStore.getState().copyAgent('fake id'))?.id,
    ).toEqual('fake agent ID');
    expect(useCollaborationStore.getState().sameWithOnline).toEqual(
      getDefaultCollaborationStore().sameWithOnline,
    );
  });

  it('removeAgentSkillItem', () => {
    const multiAgent = {
      agents: [startAgent, normalAgent1, normalAgent2],
      edges: [edge1, edge2],
      connector_type: LineType.LINE_CHART,
      botAgentInfos: [],
    };

    useMultiAgentStore.getState().setMultiAgent(multiAgent);

    const target1 = normalAgent1.skills.pluginApis[1].api_id;

    useMultiAgentStore
      .getState()
      .removeAgentSkillItem(normalAgent1.id, 'pluginApis', target1);

    expect(
      useMultiAgentStore
        .getState()
        .agents[1].skills.pluginApis.find(item => item.api_id === target1),
    ).toBeUndefined();

    const target2 = normalAgent1.skills.workflows[1].workflow_id;

    useMultiAgentStore
      .getState()
      .removeAgentSkillItem(normalAgent1.id, 'workflows', target2);

    expect(
      useMultiAgentStore
        .getState()
        .agents[1].skills.workflows.find(item => item.workflow_id === target2),
    ).toBeUndefined();

    const target3 = normalAgent1.skills.knowledge.dataSetList[1].dataset_id;

    useMultiAgentStore
      .getState()
      .removeAgentSkillItem(normalAgent1.id, 'knowledge', target3);

    expect(
      useMultiAgentStore
        .getState()
        .agents[1].skills.knowledge.dataSetList.find(
          item => item.dataset_id === target3,
        ),
    ).toBeUndefined();

    const target4 = normalAgent1.skills.pluginApis[0].api_id;

    useMultiAgentStore
      .getState()
      // @ts-expect-error for UT
      .removeAgentSkillItem(normalAgent1.id, 'wrong type', target4);

    expect(
      useMultiAgentStore
        .getState()
        .agents[1].skills.pluginApis.find(item => item.api_id === target4),
    ).toBeDefined();
  });
});

describe('addAgentIntent', () => {
  const agentsDefaultValue = [
    {
      id: 'mock_global_agent_id',
      agent_type: AgentType.Global_Agent,
      intents: [],
    },
    {
      id: 'mock_bot_agent_id',
      agent_type: AgentType.Bot_Agent,
      intents: [],
    },
  ] as unknown as BotMultiAgent['agents'];
  it('do nothing when source agent not found', () => {
    useMultiAgentStore.getState().setMultiAgent({
      agents: agentsDefaultValue,
    });
    useMultiAgentStore.getState().addAgentIntent('mock_1', 'mock_2');
    expect(useMultiAgentStore.getState().agents).toEqual(agentsDefaultValue);
  });
  it('set intent next agetn_id on global agent', () => {
    useMultiAgentStore.getState().setMultiAgent({
      agents: agentsDefaultValue,
    });
    useMultiAgentStore
      .getState()
      .addAgentIntent('mock_global_agent_id', 'mock_next_agent_id_1');
    expect(
      useMultiAgentStore
        .getState()
        .agents.find(a => a.id === 'mock_global_agent_id')?.intents?.[0]
        .next_agent_id,
    ).toBe('mock_next_agent_id_1');
    useMultiAgentStore
      .getState()
      .addAgentIntent('mock_global_agent_id', 'mock_next_agent_id_2');
    expect(
      useMultiAgentStore
        .getState()
        .agents.find(a => a.id === 'mock_global_agent_id')?.intents?.[0]
        .next_agent_id,
    ).toBe('mock_next_agent_id_2');
  });
  it('push new intent to other agent', () => {
    useMultiAgentStore.getState().setMultiAgent({
      agents: agentsDefaultValue,
    });
    useMultiAgentStore
      .getState()
      .addAgentIntent('mock_bot_agent_id', 'mock_next_agent_id_1');
    expect(
      useMultiAgentStore
        .getState()
        .agents.find(a => a.id === 'mock_bot_agent_id')?.intents?.length,
    ).toBe(1);
    useMultiAgentStore
      .getState()
      .addAgentIntent('mock_bot_agent_id', 'mock_next_agent_id_2');
    expect(
      useMultiAgentStore
        .getState()
        .agents.find(a => a.id === 'mock_bot_agent_id')?.intents?.length,
    ).toBe(2);
  });
});

describe('deleteAgentIntent', () => {
  const agentsDefaultValue = [
    {
      id: 'mock_global_agent_id',
      agent_type: AgentType.Global_Agent,
      intents: [],
    },
    {
      id: 'mock_bot_agent_id',
      agent_type: AgentType.Bot_Agent,
      intents: [
        {
          id: 'mock_intent_id',
          next_agent_id: 'mock_next_agent_id',
        },
        {
          id: 'mock_intent_id_2',
          next_agent_id: 'mock_next_agent_id_2',
        },
      ],
    },
  ] as unknown as BotMultiAgent['agents'];
  it('do nothing when source agent not found', () => {
    useMultiAgentStore.getState().setMultiAgent({
      agents: agentsDefaultValue,
    });
    useMultiAgentStore.getState().deleteAgentIntent('mock_1', 'mock_2');
    expect(useMultiAgentStore.getState().agents).toEqual(agentsDefaultValue);
  });
  it('set intent next agetn_id on global agent', () => {
    useMultiAgentStore.getState().setMultiAgent({
      agents: agentsDefaultValue,
    });
    useMultiAgentStore
      .getState()
      .deleteAgentIntent('mock_global_agent_id', 'mock_next_agent_id_2');
    useMultiAgentStore
      .getState()
      .deleteAgentIntent('mock_global_agent_id', 'mock_next_agent_id_2');
    expect(
      useMultiAgentStore
        .getState()
        .agents.find(a => a.id === 'mock_global_agent_id')?.intents?.[0]
        .next_agent_id,
    ).toBe(undefined);
  });
  it('filter intents on other agent', () => {
    useMultiAgentStore.getState().setMultiAgent({
      agents: agentsDefaultValue,
    });
    useMultiAgentStore
      .getState()
      .deleteAgentIntent('mock_bot_agent_id', 'mock_next_agent_id');
    expect(
      useMultiAgentStore
        .getState()
        .agents.find(a => a.id === 'mock_bot_agent_id')?.intents?.length,
    ).toBe(1);
  });
});

describe('addAgentIntent', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });

  it('adds a new intent to the source agent for a Global Agent correctly', () => {
    const sourceAgentId = 'sourceAgent1';
    const targetAgentId = 'targetAgent1';
    const agent = {
      agent_id: sourceAgentId,
      agent_type: AgentType.Global_Agent,
      intents: [],
    };

    useMultiAgentStore.getState().addAgent2Store(agent);
    useMultiAgentStore.getState().addAgentIntent(sourceAgentId, targetAgentId);
    const state = useMultiAgentStore.getState();
    expect(state.agents[0].intents).toEqual([
      { intent_id: expect.any(String), next_agent_id: targetAgentId },
    ]);
  });

  it('updates existing intent of the source agent for a Global Agent correctly', () => {
    const sourceAgentId = 'sourceAgent2';
    const targetAgentId1 = 'targetAgent1';
    const targetAgentId2 = 'targetAgent2';
    const agent = {
      agent_id: sourceAgentId,
      agent_type: AgentType.Global_Agent,
      intents: [{ intent_id: 'intent1', next_agent_id: targetAgentId1 }],
    };
    useMultiAgentStore.getState().addAgent2Store(agent);
    useMultiAgentStore.getState().addAgentIntent(sourceAgentId, targetAgentId2);
    const state = useMultiAgentStore.getState();
    expect(state.agents?.[0]?.intents?.[0]).toMatchObject({
      intent_id: 'intent1',
      next_agent_id: targetAgentId2,
    });
  });

  it('adds a new intent to the source agent for a non-Global Agent', () => {
    const sourceAgentId = 'sourceAgent3';
    const targetAgentId = 'targetAgent3';
    const agent = {
      agent_id: sourceAgentId,
      agent_type: AgentType.LLM_Agent,
      intents: [],
    };
    useMultiAgentStore.getState().addAgent2Store(agent);
    useMultiAgentStore.getState().addAgentIntent(sourceAgentId, targetAgentId);
    const state = useMultiAgentStore.getState();
    expect(state.agents[0].intents).toEqual([
      { intent_id: expect.any(String), next_agent_id: targetAgentId },
    ]);
  });

  it('adds multiple intents to a non-Global Agent correctly', () => {
    const sourceAgentId = 'sourceAgent4';
    const targetAgentId1 = 'targetAgent1';
    const targetAgentId2 = 'targetAgent2';
    const agent = {
      agent_id: sourceAgentId,
      agent_type: AgentType.LLM_Agent,
      intents: [],
    };
    useMultiAgentStore.getState().addAgent2Store(agent);
    const findAgent = useMultiAgentStore.getState().agents?.[0];
    // Here I want to mock the return value of findTargetAgent
    const mockFindAgent = vi
      .spyOn(findAgentModule, 'findTargetAgent')
      .mockReturnValueOnce({
        ...findAgent,
        intents: undefined,
      });
    useMultiAgentStore.getState().addAgentIntent(sourceAgentId, targetAgentId1);
    useMultiAgentStore.getState().addAgentIntent(sourceAgentId, targetAgentId2);
    const state = useMultiAgentStore.getState();
    expect(state.agents[0].intents).toHaveLength(1);
    mockFindAgent.mockRestore();
  });

  it('does not add an intent if the source agent does not exist', () => {
    const sourceAgentId = 'nonExistentAgent';
    const targetAgentId = 'targetAgent4';
    useMultiAgentStore.getState().addAgentIntent(sourceAgentId, targetAgentId);
    const state = useMultiAgentStore.getState();
    expect(state.agents).toHaveLength(0); // Expect no agents to be present
  });
});

describe('initStore', () => {
  beforeEach(() => {
    useMultiAgentStore.getState().clear();
  });
  it('initializes store with bot data in MultiMode', () => {
    const botData: GetDraftBotInfoAgwData = {
      bot_info: {
        bot_mode: BotMode.MultiMode,
        agents: [
          {
            ...startAgent,
            agent_id: startAgent.id,
            intents: [{ intent_id: 'intent1', next_agent_id: normalAgent1.id }],
          },
          { ...normalAgent1, agent_id: normalAgent1.id },
        ],
        multi_agent_info: {
          connector_type: LineType.LINE_CHART,
          session_type: MultiAgentSessionType.Flow,
        },
      },
      bot_option_data: {},
    };

    useMultiAgentStore.getState().initStore(botData);
    expect(useMultiAgentStore.getState().agents).toHaveLength(2);
    expect(useMultiAgentStore.getState().currentAgentID).toBeDefined();
  });

  it('does not set currentAgentID when not in MultiMode', () => {
    const botData = {
      bot_info: {
        bot_mode: BotMode.SingleMode,
        agents: [{ id: 'agent1' }],
        multi_agent_info: {},
      },
      bot_option_data: {},
    };
    useMultiAgentStore.getState().initStore(botData);
    expect(useMultiAgentStore.getState().currentAgentID).toBe('');
  });

  it('updates store correctly with provided multi-agent info', () => {
    const botData: GetDraftBotInfoAgwData = {
      bot_info: {
        bot_mode: BotMode.MultiMode,
        agents: [
          {
            ...startAgent,
            agent_id: startAgent.id,
            intents: [{ intent_id: 'intent1', next_agent_id: normalAgent1.id }],
          },
          { ...normalAgent1, agent_id: normalAgent1.id },
        ],
        multi_agent_info: {
          connector_type: LineType.LINE_CHART,
          session_type: MultiAgentSessionType.Host,
        },
      },
      bot_option_data: {},
    };
    useMultiAgentStore.getState().initStore(botData);
    expect(useMultiAgentStore.getState().agents).toHaveLength(2);
    expect(useMultiAgentStore.getState().chatModeConfig.type).toBe(
      MultiAgentSessionType.Host,
    );
  });
});
describe('updateBotNodeInfo', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
    vi.clearAllMocks();
  });
  it('updates botAgentInfos correctly when given valid bot agents', async () => {
    const agents = [
      {
        agent_type: AgentType.Bot_Agent,
        reference_id: 'bot1',
        current_version: '1.0',
      },
    ];
    const mockBotInfos = {
      code: 0,
      msg: '',
      data: [{ id: 'bot1', name: 'Bot One' }],
    };

    vi.spyOn(SpaceApiV2, 'MGetBotByVersion').mockResolvedValueOnce(
      mockBotInfos,
    );
    await useMultiAgentStore.getState().updateBotNodeInfo(agents);

    expect(useMultiAgentStore.getState().botAgentInfos).toMatchObject([
      { id: 'bot1', name: 'Bot One' },
    ]);
  });

  it('does not update botAgentInfos if no Bot_Agent is present', async () => {
    const agents = [
      {
        agent_type: AgentType.Global_Agent,
        reference_id: 'global1',
        current_version: '1.0',
      },
    ];
    const mockBotInfos = { data: [{ id: 'bot1', name: 'Bot One' }] };

    (SpaceApiV2.MGetBotByVersion as Mock).mockResolvedValue(mockBotInfos);

    await useMultiAgentStore.getState().updateBotNodeInfo(agents);

    expect(useMultiAgentStore.getState().botAgentInfos).toEqual([]);
  });

  it('handles empty agents array gracefully', async () => {
    const agents: any[] = [];

    await useMultiAgentStore.getState().updateBotNodeInfo(agents);

    expect(useMultiAgentStore.getState().botAgentInfos).toEqual([]);
  });
});
