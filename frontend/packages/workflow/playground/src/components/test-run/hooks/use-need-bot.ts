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
 * Check if a session node is included
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
 * Gets whether the LLM type node has session history enabled
 * @param workflowJson json data of the current node
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
 * Check whether the current node is an LLM, an Intent node, and open the session history
 * @param node Current node
 * @param workflowJson json data of the current node
 * @Returns whether the current node is an LLM, Intent node, and the session history is enabled, returns true, otherwise false
 */
function checkLLMEnableHistory(node: FlowNodeEntity, workflowJson: NodeData) {
  const isLLMNode = [StandardNodeType.LLM, StandardNodeType.Intent].includes(
    node.flowNodeType as StandardNodeType,
  );

  const enableChatHistory = isLLMNode && getEnableChatHistory(workflowJson);

  // At present, there are only LLM type nodes. When opening the session history, single-node debugging needs to display "Select Session".
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

    /** @Deprecated This field is not currently used and can be deleted later */
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

    // The process (including the subflow drill-down node) has Variable, Database, and LLM for opening chat history | | subflow nodes have subflow
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

    /** If it is a scene workflow, the default Bot of the scene will be automatically associated, and there is no need to manually select it here. */
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

  /** Part of the calculation form requires a bot environment */
  // eslint-disable-next-line complexity -- refactor later
  const queryNeedBot = async (
    testFormType: TestFormType,
    node: FlowNodeEntity,
  ) => {
    let isNeedBotEnv = {
      /** Do you need to display the selected agent/application? */
      needBot: false,

      /** Do you need to show the selection session? */
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

    // If it is a project, it is not necessary to display the selection agent/application, but to further determine whether the session node needs to be displayed.
    if (globalState.projectId) {
      const isSubworkflow = nodeType === StandardNodeType.SubWorkflow;

      isNeedBotEnv.needConversation =
        checkLLMEnableHistory(node, workflowJson) ||
        (isSubworkflow && nodeIsChatflow && isConversationNameRef);

      return isNeedBotEnv;
    }

    /** A single node only needs to determine whether this node is a relevant node */
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

        // If it is a single-node debugging chatflow, if it is not in the project, it is necessary to display the application selector and have cascading session selection
        // You don't need to determine what type of nodes are in this chatflow, this logic will be more concise
        if (nodeIsChatflow) {
          isNeedBotEnv.needBot = !globalState.projectId;
          isNeedBotEnv.needConversation = isConversationNameRef;
        }
      } else if (
        [StandardNodeType.Loop, StandardNodeType.Batch].includes(nodeType)
      ) {
        isNeedBotEnv = await isNeedBot();
      } else if (CONVERSATION_NODES.includes(nodeType)) {
        // If it is a session node
        isNeedBotEnv.needBot = true;
        isNeedBotEnv.hasConversationNode = true;
      } else if (
        [...MESSAGE_NODES, ...CONVERSATION_HISTORY_NODES].includes(nodeType)
      ) {
        // If it is a message node
        isNeedBotEnv.needBot = true;
      } else if (node.getData(WorkflowNodeRefVariablesData).hasGlobalRef) {
        // Node selection If global variables are configured, you need to remind to select bot\ project.
        isNeedBotEnv.needBot = true;
      }
    } else {
      if (globalState.isChatflow) {
        isNeedBotEnv = await isNeedBot();

        // Chatflow in the resource library, the whole process runs, and a selected item is required.
        isNeedBotEnv.needBot = true;
        // Chatflow also doesn't have to select a session in the form
        isNeedBotEnv.needConversation = false;
      } else {
        /** Workflow in the resource library, the whole process runs, and the whole process needs to be traversed, including sub-processes */
        isNeedBotEnv = await isNeedBot();
        // Under workflow, the whole process practice runs disable conversation
        isNeedBotEnv.needConversation = false;
      }
    }

    return isNeedBotEnv;
  };

  return { queryNeedBot };
};

export { useNeedBot };
