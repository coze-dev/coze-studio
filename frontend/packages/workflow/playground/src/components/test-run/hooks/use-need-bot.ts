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
 
import { get, intersection } from 'lodash-es';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  useService,
  WorkflowDocument,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeRefVariablesData } from '@coze-workflow/variable';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import {
  StandardNodeType,
  CONVERSATION_NODES,
  MESSAGE_NODES,
  CONVERSATION_HISTORY_NODES,
  WorkflowMode,
  ValueExpression,
  CONVERSATION_NAME,
} from '@coze-workflow/base';

import { TestFormType } from '../constants';
import {
  useGetWorkflowMode,
  useWorkflowOperation,
  useGlobalState,
} from '../../../hooks';

/**
 * 检查是否包含会话节点
 * @param typeList
 * @returns
 */
function checkHasConversationNode(typeList: StandardNodeType[]) {
  return intersection(typeList, CONVERSATION_NODES).length > 0;
}

function checkHasMessageNode(typeList: StandardNodeType[]) {
  return intersection(typeList, MESSAGE_NODES).length > 0;
}

function checkHasConversationHistoryNode(typeList: StandardNodeType[]) {
  return intersection(typeList, CONVERSATION_HISTORY_NODES).length > 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NodeData = any;

/**
 * 获取 LLM 类型节点是否开启了会话历史
 * @param workflowJson 当前节点的 json 数据
 * @returns
 */
function getEnableChatHistory(workflowJson: NodeData) {
  const llmParam = get(workflowJson, 'data.inputs.llmParam');
  const isIntentNode = workflowJson.type === StandardNodeType.Intent;
  const enableChatHistory = isIntentNode
    ? llmParam?.enableChatHistory
    : get(
        (llmParam || []).find(item => item.name === 'enableChatHistory'),
        'input.value.content',
      ) || false;

  return Boolean(enableChatHistory);
}

/**
 * 检测当前节点是否为 LLM、Intent 节点，并且开启了会话历史
 * @param node 当前节点
 * @param workflowJson 当前节点的 json 数据
 * @returns 当前节点是否为 LLM、Intent 节点，并且开启了会话历史，返回 true，否则 false
 */
function checkLLMEnableHistory(node: FlowNodeEntity, workflowJson: NodeData) {
  const isLLMNode = [StandardNodeType.LLM, StandardNodeType.Intent].includes(
    node.flowNodeType as StandardNodeType,
  );

  const enableChatHistory = isLLMNode && getEnableChatHistory(workflowJson);

  // 目前只有 LLM 类型节点，开启会话历史时，单节点调试需要展示「选择会话」
  return enableChatHistory;
}

/**
 * Weather current node is subworkflow node and  it's a chatflow
 * @param node current test node
 * @returns
 */
function checkNodeIsChatflow(node: FlowNodeEntity) {
  const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);
  const subWorkflowDetail =
    nodeData?.getNodeData<StandardNodeType.SubWorkflow>();

  const nodeIsChatflow = subWorkflowDetail?.flow_mode === WorkflowMode.ChatFlow;
  return nodeIsChatflow;
}

/**
 * Weather current node data contains a `CONVERSATION_NAME` input, and it is a ref
 * @param workflowJson current test node data
 * @returns
 */
function checkHasConversationNameRef(workflowJson: NodeData) {
  const conversationNameItem = (
    get(workflowJson, 'data.inputs.inputParameters') || []
  ).find(v => v?.name === CONVERSATION_NAME);

  const isConversationNameRef = conversationNameItem
    ? ValueExpression.isRef(conversationNameItem?.input?.value)
    : false;

  return isConversationNameRef;
}

// eslint-disable-next-line max-lines-per-function
const useNeedBot = () => {
  const operation = useWorkflowOperation();
  const workflowDocument = useService<WorkflowDocument>(WorkflowDocument);
  const { isSceneFlow, isChatflow } = useGetWorkflowMode();
  const globalState = useGlobalState();

  // eslint-disable-next-line complexity
  const isNeedBot = async () => {
    const nodeTypes = await operation.queryNodeType();
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

    /** @deprecated 这个字段目前没有用到，后续可以删除 */
    const hasDatabaseNode = sumTypeList.includes(StandardNodeType.Database);
    const hasIntentNode = sumTypeList.includes(StandardNodeType.Intent);
    const hasLLMNode = sumTypeList.includes(StandardNodeType.LLM);
    const hasLTMNode = sumTypeList.includes(StandardNodeType.LTM);
    const hasConversationNode = checkHasConversationNode(sumTypeList);
    const hasMessageNode = checkHasMessageNode(sumTypeList);
    const hasConversationHistoryNode =
      checkHasConversationHistoryNode(sumTypeList);
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
    const needBot =
      hasNodeUseGlobalVariable ||
      hasVariableAssignNode ||
      hasVariableNode ||
      hasLTMNode ||
      hasChatHistoryEnabledLLM ||
      hasSubFlowNode ||
      hasConversationNode ||
      hasMessageNode ||
      hasConversationHistoryNode;

    const needConversation = hasChatHistoryEnabledLLM;

    /** 如果是场景工作流，会自动关联场景的预设Bot，不需要这里手动选择 */
    if (isSceneFlow) {
      return {
        needBot: false,
        needConversation: false,
        hasVariableNode,
        hasVariableAssignNode,
        hasNodeUseGlobalVariable,
        hasDatabaseNode,
        hasLTMNode,
        hasChatHistoryEnabledLLM,
        isChatflow: globalState.isChatflow,
        hasConversationNode,
      };
    }

    return {
      needBot,
      needConversation,
      hasVariableNode,
      hasVariableAssignNode,
      hasNodeUseGlobalVariable,
      hasDatabaseNode,
      hasLTMNode,
      hasChatHistoryEnabledLLM,
      isChatflow: globalState.isChatflow,
      hasConversationNode,
    };
  };

  /** part 计算表单是否需要 bot 环境 */
  // eslint-disable-next-line complexity -- refactor later
  const queryNeedBot = async (
    testFormType: TestFormType,
    node: FlowNodeEntity,
  ) => {
    let isNeedBotEnv = {
      /** 是否需要展示选择智能体/应用 */
      needBot: false,

      /** 是否需要展示选择会话 */
      needConversation: false,
      hasVariableNode: false,
      hasVariableAssignNode: false,
      hasDatabaseNode: false,
      hasLTMNode: false,
      hasChatHistoryEnabledLLM: false,
      isChatflow: globalState.isChatflow,
      hasConversationNode: false,
    };

    if (isSceneFlow) {
      return isNeedBotEnv;
    }

    const nodeType = node.flowNodeType as StandardNodeType;
    const workflowJson = await workflowDocument.toNodeJSON(node);
    const nodeIsChatflow = checkNodeIsChatflow(node);
    const isConversationNameRef = checkHasConversationNameRef(workflowJson);

    // 如果是项目中，不需要展示选择智能体/应用，只需要进一步判断是否需要展示会话节点
    if (globalState.projectId) {
      const isSubworkflow = nodeType === StandardNodeType.SubWorkflow;

      isNeedBotEnv.needConversation =
        checkLLMEnableHistory(node, workflowJson) ||
        (isSubworkflow && nodeIsChatflow && isConversationNameRef);

      return isNeedBotEnv;
    }

    /** 单节点只需要判断本节点是否是相关节点 */
    if (testFormType === TestFormType.Single) {
      if (nodeType === StandardNodeType.Variable) {
        isNeedBotEnv.needBot = true;
        isNeedBotEnv.hasVariableNode = true;
      } else if (nodeType === StandardNodeType.VariableAssign) {
        isNeedBotEnv.needBot = true;
        isNeedBotEnv.hasVariableAssignNode = true;
      } else if (nodeType === StandardNodeType.Database) {
        isNeedBotEnv.hasDatabaseNode = true;
      } else if (nodeType === StandardNodeType.LTM) {
        isNeedBotEnv.needBot = true;
        isNeedBotEnv.hasLTMNode = true;
      } else if (
        [StandardNodeType.LLM, StandardNodeType.Intent].includes(nodeType) &&
        isChatflow
      ) {
        const enableChatHistory = getEnableChatHistory(workflowJson);
        if (enableChatHistory) {
          isNeedBotEnv.needBot = true;
          isNeedBotEnv.needConversation = true;
          isNeedBotEnv.hasChatHistoryEnabledLLM = true;
        }
      } else if (nodeType === StandardNodeType.SubWorkflow) {
        isNeedBotEnv = await isNeedBot();

        // 如果是单节点调试 chatflow，如果不在项目内，都需要展示应用选择器，以及具备级联会话选择
        // 不需要判断这个 chatflow 中有什么类型的节点，这个逻辑会比较简洁
        if (nodeIsChatflow) {
          isNeedBotEnv.needBot = !globalState.projectId;
          isNeedBotEnv.needConversation = isConversationNameRef;
        }
      } else if (
        [StandardNodeType.Loop, StandardNodeType.Batch].includes(nodeType)
      ) {
        isNeedBotEnv = await isNeedBot();
      } else if (CONVERSATION_NODES.includes(nodeType)) {
        // 如果是会话节点
        isNeedBotEnv.needBot = true;
        isNeedBotEnv.hasConversationNode = true;
      } else if (
        [...MESSAGE_NODES, ...CONVERSATION_HISTORY_NODES].includes(nodeType)
      ) {
        // 如果是消息节点
        isNeedBotEnv.needBot = true;
      } else if (node.getData(WorkflowNodeRefVariablesData).hasGlobalRef) {
        // 节点选择配置了全局变量则需要提醒选择 bot \ project
        isNeedBotEnv.needBot = true;
      }
    } else {
      if (globalState.isChatflow) {
        isNeedBotEnv = await isNeedBot();

        // 资源库中的 chatflow，全流程运行，需要有选择项目
        isNeedBotEnv.needBot = true;
        // chatflow 也无须在表单中选择会话
        isNeedBotEnv.needConversation = false;
      } else {
        /** 资源库中的 workflow，全流程运行，需要遍历全流程，包括子流程 */
        isNeedBotEnv = await isNeedBot();
        // workflow 下，全流程试运行禁用 conversation
        isNeedBotEnv.needConversation = false;
      }
    }

    return isNeedBotEnv;
  };

  return { queryNeedBot };
};

export { useNeedBot };
