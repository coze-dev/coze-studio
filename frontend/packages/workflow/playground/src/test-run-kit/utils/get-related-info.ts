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

import { intersection } from 'lodash-es';
import {
  workflowApi,
  CONVERSATION_NODES,
  StandardNodeType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

interface GetRelatedInfoOptions {
  workflowId: string;
  spaceId: string;
}
function checkHasConversationNode(typeList: StandardNodeType[]) {
  return intersection(typeList, CONVERSATION_NODES).length > 0;
}

export const getRelatedInfo = async (options: GetRelatedInfoOptions) => {
  const { workflowId, spaceId } = options;
  const { data: nodeTypes } = await workflowApi.QueryWorkflowNodeTypes({
    workflow_id: workflowId,
    space_id: spaceId,
  });
  const flowTypeList = nodeTypes?.node_types ?? [];
  const subFlowTypeList = nodeTypes?.sub_workflow_node_types ?? [];
  const sumTypeList = [
    ...flowTypeList,
    ...subFlowTypeList,
  ] as StandardNodeType[];

  const flowPropsList = nodeTypes?.nodes_properties ?? [];
  const subFlowPropsList = nodeTypes?.sub_workflow_nodes_properties ?? [];
  const sumPropsList = [...flowPropsList, ...subFlowPropsList];

  const hasVariableNode = sumTypeList.includes(StandardNodeType.Variable);
  const hasVariableAssignNode = sumTypeList.includes(
    StandardNodeType.VariableAssign,
  );

  const hasIntentNode = sumTypeList.includes(StandardNodeType.Intent);
  const hasLLMNode = sumTypeList.includes(StandardNodeType.LLM);
  const hasLTMNode = sumTypeList.includes(StandardNodeType.LTM);
  const hasConversationNode = checkHasConversationNode(sumTypeList);
  const propsEnableChatHistory = sumPropsList.some(
    item => item.is_enable_chat_history,
  );
  const hasNodeUseGlobalVariable = !!sumPropsList.find(
    item => item.is_ref_global_variable,
  );

  const hasChatHistoryEnabledLLM =
    (hasLLMNode || hasIntentNode) && propsEnableChatHistory;

  const hasSubFlowNode = subFlowTypeList.some(it =>
    [StandardNodeType.SubWorkflow].includes(it as StandardNodeType),
  );

  // The process (including the subflow drill-down node) has Variable, Database, and LLM for opening chat history | | subflow nodes have subflow
  const isNeedBot =
    hasNodeUseGlobalVariable ||
    hasVariableAssignNode ||
    hasVariableNode ||
    hasLTMNode ||
    hasChatHistoryEnabledLLM ||
    hasSubFlowNode ||
    hasConversationNode;

  const isNeedConversation = hasChatHistoryEnabledLLM;

  return {
    isNeedBot,
    isNeedConversation,
    hasVariableNode,
    hasVariableAssignNode,
    hasNodeUseGlobalVariable,
    hasLTMNode,
    hasChatHistoryEnabledLLM,
    hasConversationNode,
    // When including a session class node, you need to disable the bot option
    disableBot: hasConversationNode,
    disableBotTooltip: hasConversationNode ? I18n.t('wf_chatflow_141') : '',
    // Includes LTM nodes, project option needs to be disabled
    disableProject: hasLTMNode,
    disableProjectTooltip: hasLTMNode ? I18n.t('wf_chatflow_142') : '',
  };
};
