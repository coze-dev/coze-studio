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

  // 流程中（包含 subflow 下钻节点）有 Variable、Database、开启 chat history 的LLM || subflow 节点有 subflow
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
    // 当包含会话类节点，需要禁用 bot 选项
    disableBot: hasConversationNode,
    disableBotTooltip: hasConversationNode ? I18n.t('wf_chatflow_141') : '',
    // 包含 LTM 节点，需要禁用项目选项
    disableProject: hasLTMNode,
    disableProjectTooltip: hasLTMNode ? I18n.t('wf_chatflow_142') : '',
  };
};
