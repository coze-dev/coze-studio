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
 
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { isEqual, uniqWith } from 'lodash-es';
import { produce } from 'immer';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import {
  type BotOptionData,
  type bot_common,
  type AgentReferenceInfo,
  type Agent as AgentFromPlayground,
  BotMode,
  type GetDraftBotInfoAgwData,
} from '@coze-arch/idl/playground_api';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { SpaceApiV2 } from '@coze-arch/bot-space-api';
import { UIToast } from '@coze-arch/bot-semi';
import {
  AgentType,
  AgentVersionCompat,
  MultiAgentSessionType,
  type PluginApi,
} from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';
import { LineType } from '@flowgram-adapter/free-layout-editor';
import type { WorkflowEdgeJSON } from '@flowgram-adapter/free-layout-editor';
import type { IPoint } from '@flowgram-adapter/common';

import { type SetterAction, setterActionFactory } from '@/utils/setter-factory';
import { getPluginApisFilterExample } from '@/utils/plugin-apis';
import {
  findAgentByNextIntentID,
  findFirstAgent,
  findFirstAgentId,
  findTargetAgent,
} from '@/utils/find-agent';
import type { BotDetailSkill, KnowledgeConfig } from '@/types/skill';

import { useManuallySwitchAgentStore } from '../manually-switch-agent-store';
import { useCollaborationStore } from '../collaboration';
import { useBotInfoStore } from '../bot-info';
import {
  type Agent,
  type ChatModeConfig,
  type DraftBotVo,
  type MultiSheetViewOpenState,
} from '../../types/agent';
import { transformDto2Vo, transformVo2Dto } from './transform';

export interface MultiAgentStore {
  agents: Agent[];
  edges: WorkflowEdgeJSON[];
  connector_type: LineType;
  /** 用于保存 bot 类型节点的 bot 信息 */
  botAgentInfos: DraftBotVo[];
  /**
   * 会话接管方式配置
   * 默认为 flow 模式
   */
  chatModeConfig: ChatModeConfig;
  /** 当前agent id **/
  currentAgentID: string;
  /**muti 左右展开状态**/
  multiSheetViewOpen: MultiSheetViewOpenState;
}

export const getDefaultMultiAgentStore = (): MultiAgentStore => ({
  agents: [],
  edges: [],
  connector_type: LineType.BEZIER,
  currentAgentID: '',
  botAgentInfos: [],
  multiSheetViewOpen: {
    left: true,
    right: true,
  },
  chatModeConfig: {
    type: MultiAgentSessionType.Host,
    currentHostId: '',
  },
});

export interface MultiAgentAction {
  setMultiAgent: SetterAction<MultiAgentStore>;
  setMultiAgentByImmer: (update: (state: MultiAgentStore) => void) => void;
  setMultiSheetViewOpen: (state: Partial<MultiSheetViewOpenState>) => void;
  updatedCurrentAgentIdWithConnectStart: () => void;
  /** 重置 host 节点为 start 相连的节点 */
  resetHostAgent: () => void;
  /**
   * 设置sourceAgentId的portId的intent的next_agent_id为nextAgentId
   *
   * @deprecated 这是旧版画布的方法，新版为 addAgentIntent
   */
  setAgentIntentNextID: (
    sourceAgentId?: string,
    portId?: string,
    agentId?: string,
  ) => void;
  addAgentIntent: (sourceAgentId: string, targetAgentId: string) => void;
  deleteAgentIntent: (sourceAgentId: string, targetAgentId: string) => void;
  /**
   * 根据agentId找到当前agent的source的agent，也就是上游agent
   * 将上游agent中找到某个intent，next_agent_id === agentId。将该intent的next_agent_id清空
   */
  clearEdgesByTargetAgentId: (agentId?: string) => void;
  updateAgentSkillKnowledgeDatasetInfo: (
    agentId: string,
    dataSetInfo: KnowledgeConfig['dataSetInfo'],
  ) => void;
  updateAgentSkillPluginApis: (
    agentId: string,
    pluginApis: Array<PluginApi>,
  ) => void;
  addAgent2Store: (
    agentInfo: bot_common.Agent,
    optionData?: BotOptionData,
  ) => Agent;
  addAgent: (config: {
    /** @default AgentType.LLM_Agent */
    type?: AgentType;
    position?: IPoint;
    /** 是否使用struct版本 - 便于写单测即将删除*/
    structFlag?: boolean;
  }) => Promise<Agent | undefined>;
  batchAddBotAgent: (config: {
    bots: AgentReferenceInfo[];
    positions: IPoint[];
    /** 是否使用struct版本 - 便于写单测即将删除*/
    structFlag?: boolean;
  }) => Promise<Agent[]>;
  updateBotNodeInfo: (
    agents: AgentFromPlayground[],
  ) => Promise<void> | undefined;
  copyAgent: (agentId: string) => Promise<Agent | undefined>;
  removeAgentSkillItem: (
    agentId: string,
    type: keyof Pick<BotDetailSkill, 'pluginApis' | 'workflows' | 'knowledge'>,
    apiId?: string,
  ) => void;
  /**
   * 清除一条 intent 的 next_id（也就是 edge）
   *
   * - Q1：为什么不直接使用 intent id 来找 intent？
   * - A1：将一条已有的连线拖拽连接到另一个节点时，SDK 会先触发这个 intent 的 addEdge 事件，随后再触发 deleteEdge 事件。
   *      导致 deleteEdge 事件会通过 intent id 覆盖 addEdge 刚刚更新过的 intent。
   *
   * - Q2：那通过 targetAgentId 来找 intent 不够吗，为什么还需要 intent id？
   * - A2：当同一个节点的两个 intent 都指向同一个目标，这时删除其中一条连线，无法确定删除的是哪条，必须配合 intent id 来判断
   *
   * @deprecated 旧版画布的方法，新版为 deleteAgentIntent
   */
  clearIntentNextId: (
    sourceAgentId: string,
    targetAgentId: string,
    intentId: string,
  ) => void;
  transformDto2Vo: typeof transformDto2Vo;
  transformVo2Dto: typeof transformVo2Dto;
  initStore: (botData: GetDraftBotInfoAgwData) => void;
  clear: () => void;
}

export const useMultiAgentStore = create<MultiAgentStore & MultiAgentAction>()(
  devtools(
    // eslint-disable-next-line @coze-arch/max-line-per-function
    subscribeWithSelector((set, get) => ({
      ...getDefaultMultiAgentStore(),
      setMultiAgent: setterActionFactory<MultiAgentStore>(set),
      setMultiAgentByImmer: update =>
        set(produce<MultiAgentStore>(multiAgent => update(multiAgent))),
      setMultiSheetViewOpen: (state: Partial<MultiSheetViewOpenState>) => {
        set(s => ({
          ...s,
          multiSheetViewOpen: {
            ...s.multiSheetViewOpen,
            ...state,
          },
        }));
      },
      updatedCurrentAgentIdWithConnectStart: () => {
        const firstAgent = findFirstAgent(get());
        const newAgentId = firstAgent?.id;
        useManuallySwitchAgentStore.getState().clearAgentId();
        if (newAgentId) {
          set(
            produce<MultiAgentStore>(state => {
              state.currentAgentID = newAgentId;
            }),
          );
        }
      },
      resetHostAgent: () => {
        const firstAgentId = findFirstAgentId(get());
        if (!firstAgentId) {
          return;
        }
        set(
          produce<MultiAgentStore>(multiAgent => {
            if (multiAgent.chatModeConfig.type !== MultiAgentSessionType.Host) {
              return;
            }
            multiAgent.chatModeConfig.currentHostId = firstAgentId;
          }),
        );
      },
      setAgentIntentNextID: (
        sourceAgentId?: string,
        portId?: string,
        agentId?: string,
      ) => {
        set(
          produce<MultiAgentStore>(state => {
            const { agents } = state;
            const sourceAgent = findTargetAgent(agents, sourceAgentId);
            if (sourceAgent) {
              const targetIntent = sourceAgent.intents?.find(
                item => item.intent_id === portId,
              );
              if (targetIntent && agentId) {
                targetIntent.next_agent_id = agentId;
              }
            }
          }),
        );
      },
      clearIntentNextId: (
        sourceAgentId: string,
        targetAgentId: string,
        intentId: string,
      ) => {
        set(
          produce<MultiAgentStore>(state => {
            const sourceAgent = findTargetAgent(state.agents, sourceAgentId);
            const sourceIntent = sourceAgent?.intents?.find(
              i =>
                i.next_agent_id === targetAgentId && i.intent_id === intentId,
            );
            if (!sourceIntent) {
              return;
            }
            sourceIntent.next_agent_id = undefined;
          }),
        );
      },
      addAgentIntent: (sourceAgentId, targetAgentId) => {
        set(
          produce<MultiAgentStore>(({ agents }) => {
            const sourceAgent = findTargetAgent(agents, sourceAgentId);
            if (!sourceAgent) {
              return;
            }
            const newIntent = {
              intent_id: nanoid(),
              next_agent_id: targetAgentId,
            };
            switch (sourceAgent.agent_type) {
              case AgentType.Global_Agent:
                if (sourceAgent.intents?.[0]) {
                  sourceAgent.intents[0].next_agent_id = targetAgentId;
                } else {
                  sourceAgent.intents = [newIntent];
                }
                break;
              default:
                if (sourceAgent.intents) {
                  sourceAgent.intents.push(newIntent);
                } else {
                  sourceAgent.intents = [newIntent];
                }
            }
          }),
        );
      },
      deleteAgentIntent: (sourceAgentId, targetAgentId) =>
        set(
          produce<MultiAgentStore>(({ agents }) => {
            const sourceAgent = findTargetAgent(agents, sourceAgentId);
            if (!sourceAgent) {
              return;
            }
            switch (sourceAgent.agent_type) {
              case AgentType.Global_Agent:
                if (sourceAgent.intents?.[0]) {
                  sourceAgent.intents[0].next_agent_id = undefined;
                } else {
                  sourceAgent.intents = [{ intent_id: nanoid() }];
                }
                break;
              default:
                sourceAgent.intents =
                  sourceAgent.intents?.filter(
                    intent => intent.next_agent_id !== targetAgentId,
                  ) || [];
            }
          }),
        ),
      clearEdgesByTargetAgentId: (targetAgentId?: string) => {
        set(
          produce<MultiAgentStore>(state => {
            const { agents } = state;
            const sourceAgent = findAgentByNextIntentID(agents, targetAgentId);

            if (sourceAgent) {
              const { intents } = sourceAgent;

              // 执行第一步指令。将上游agent的next_agent_id清空
              intents?.forEach(item => {
                if (item.next_agent_id === targetAgentId) {
                  item.next_agent_id = undefined;
                }
              });
            }
          }),
        );
      },
      updateAgentSkillKnowledgeDatasetInfo: (agentId, dataSetInfo) => {
        set(
          produce<MultiAgentStore>(state => {
            const findAgent = findTargetAgent(state.agents, agentId);
            if (findAgent) {
              findAgent.skills.knowledge.dataSetInfo = dataSetInfo;
            }
          }),
        );
      },
      updateAgentSkillPluginApis: (agentId, pluginApis) => {
        set(
          produce<MultiAgentStore>(state => {
            const findAgent = findTargetAgent(state.agents, agentId);
            if (findAgent) {
              findAgent.skills.pluginApis =
                getPluginApisFilterExample(pluginApis);
            }
          }),
        );
      },
      addAgent2Store: (
        agentInfo: bot_common.Agent,
        optionData?: BotOptionData,
      ) => {
        const agent = transformDto2Vo.agent(optionData, agentInfo);
        set(
          produce<MultiAgentStore>(state => {
            state.agents.push(agent);
          }),
        );
        return agent;
      },
      addAgent: async ({ type = AgentType.LLM_Agent, position }) => {
        const { botId } = useBotInfoStore.getState();
        const { getBaseVersion, setCollaborationByImmer } =
          useCollaborationStore.getState();
        const createAgentParams = {
          agent_type: type,
          bot_id: botId,
          position,
          base_commit_version: getBaseVersion(),
          version_compat: AgentVersionCompat.NewVersion,
        };
        const { data, same_with_online, branch } =
          await PlaygroundApi.CreateAgentV2(createAgentParams);
        if (!data) {
          UIToast.error({
            content: withSlardarIdButton(
              I18n.t('chatflow_error_create_failed'),
            ),
          });
          return;
        }
        setCollaborationByImmer(state => {
          state.sameWithOnline = same_with_online ?? false;
          state.branch = branch;
        });
        return get().addAgent2Store(data);
      },
      batchAddBotAgent: async ({ bots, positions }) => {
        const spaceId = useSpaceStore.getState().space.id as string;
        const { botId } = useBotInfoStore.getState();
        const { getBaseVersion, setCollaborationByImmer } =
          useCollaborationStore.getState();
        const { botAgentInfos } = get();
        const batchCreateAgentParams = {
          bot_id: botId,
          agent_type: AgentType.Bot_Agent,
          position: positions,
          references: bots,
          agent_cnt: bots.length,
          base_commit_version: getBaseVersion(),
        };
        const [
          { data: agentInfos, same_with_online, branch },
          { data: botInfos },
        ] = await Promise.all([
          PlaygroundApi.BatchCreateAgentV2(batchCreateAgentParams),
          PlaygroundApi.MGetBotByVersion({
            space_id: spaceId,
            bot_versions: bots?.map(e => ({
              bot_id: e.ReferenceId,
              version: e.Version,
            })),
          }),
        ]);

        if (
          !Array.isArray(agentInfos) ||
          agentInfos.length === 0 ||
          !Array.isArray(botInfos) ||
          botInfos.length === 0
        ) {
          UIToast.error({
            content: withSlardarIdButton(
              I18n.t('chatflow_error_create_failed'),
            ),
          });
          return [] as Agent[];
        }
        const botInfosVo = botInfos.map(transformDto2Vo.botNodeInfo);
        setCollaborationByImmer(store => {
          store.sameWithOnline = same_with_online ?? false;
          store.branch = branch;
        });
        set(
          produce<MultiAgentStore>(store => {
            store.botAgentInfos = uniqWith(
              [...botAgentInfos, ...botInfosVo],
              isEqual,
            );
          }),
        );
        return agentInfos.map(e => {
          const botInfo = botInfosVo.find(b => b.id === e.reference_id);
          return get().addAgent2Store({
            ...e,
            agent_name: botInfo?.name,
            icon_uri: botInfo?.icon_url,
          });
        });
      },
      copyAgent: async (agentId: string) => {
        const { botId } = useBotInfoStore.getState();
        const { getBaseVersion } = useCollaborationStore.getState();
        const copyAgentParams = {
          space_id: useSpaceStore.getState().getSpaceId(),
          bot_id: botId,
          base_commit_version: getBaseVersion(),
          agent_id: agentId,
        };
        const { data, bot_option_data = {} } = await PlaygroundApi.CopyAgentV2(
          copyAgentParams,
        );
        if (!data) {
          UIToast.error({
            content: withSlardarIdButton(
              I18n.t('chatflow_error_create_failed'),
            ),
          });
          return;
        }
        return get().addAgent2Store(data, bot_option_data);
      },
      removeAgentSkillItem: (agentId, type, apiId) => {
        set(
          produce<MultiAgentStore>(s => {
            const findAgent = findTargetAgent(s.agents, agentId);
            if (findAgent?.skills) {
              switch (type) {
                case 'pluginApis': {
                  findAgent.skills.pluginApis =
                    findAgent.skills.pluginApis.filter(
                      item => item.api_id !== apiId,
                    );
                  break;
                }
                case 'workflows': {
                  findAgent.skills.workflows =
                    findAgent.skills.workflows.filter(
                      item => item.workflow_id !== apiId,
                    );
                  break;
                }
                case 'knowledge': {
                  findAgent.skills.knowledge.dataSetList =
                    findAgent.skills.knowledge.dataSetList.filter(
                      item => item.dataset_id !== apiId,
                    );
                  break;
                }
                default:
                  console.warn('[removeAgentSkillItem]: ?');
              }
            }
          }),
        );
      },
      updateBotNodeInfo: agents => {
        const { setMultiAgentByImmer } = get();
        const botAgents = agents.filter(
          e => e.agent_type === AgentType.Bot_Agent,
        );
        if (Array.isArray(botAgents) && botAgents.length > 0) {
          return SpaceApiV2.MGetBotByVersion({
            bot_versions: botAgents?.map(e => ({
              bot_id: e.reference_id,
              version: e.current_version,
            })),
          }).then(botInfos => {
            setMultiAgentByImmer(s => {
              s.botAgentInfos = (botInfos.data ?? []).map(
                transformDto2Vo.botNodeInfo,
              );
            });
          });
        }
      },
      transformDto2Vo,
      transformVo2Dto,
      initStore: botData => {
        const { bot_info: botInfo } = botData;
        const {
          transformDto2Vo: transformDto2Vo4Multi,
          updatedCurrentAgentIdWithConnectStart,
          updateBotNodeInfo,
        } = get();

        const {
          bot_info: { agents, multi_agent_info: multiInfo },
          bot_option_data: botOpts,
        } = botData;

        set(
          transformDto2Vo4Multi.multiAgent({
            agents,
            multiInfo,
            botOpts,
          }),
        );
        const isMultiAgent = botInfo?.bot_mode === BotMode.MultiMode;
        if (isMultiAgent) {
          // 设置初始的对话agent id
          updatedCurrentAgentIdWithConnectStart();
          // 获取agent节点为子bot的子bot信息，并赋值入store
          updateBotNodeInfo(botInfo?.agents || []);
        }
      },
      clear: () => {
        // eslint-disable-next-line max-lines
        set({ ...getDefaultMultiAgentStore() });
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botDetail.multiAgent',
    },
  ),
);
