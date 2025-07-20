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
  type WorkflowNodeJSON,
  type WorkflowJSON,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowMode } from '@coze-workflow/base';

function getIsInitStartOuputs(
  initStartNode: WorkflowNodeJSON,
  flowMode: WorkflowMode,
) {
  if (flowMode === WorkflowMode.Workflow) {
    return (
      initStartNode?.data?.outputs?.length === 1 ||
      (initStartNode?.data?.outputs?.length === 2 &&
        !initStartNode.data.outputs[1]?.name &&
        initStartNode.data.outputs[1]?.required &&
        initStartNode.data.outputs[1].type === 'string' &&
        !initStartNode.data.outputs[1]?.assistType &&
        !initStartNode.data.outputs[1]?.description)
    );
  } else if (flowMode === WorkflowMode.ChatFlow) {
    return (
      initStartNode?.data?.outputs?.length === 2 &&
      initStartNode.data.outputs[0]?.name === 'USER_INPUT' &&
      initStartNode.data.outputs[1]?.name === 'CONVERSATION_NAME'
    );
  }
}

/**
 *
 * 判断当前工作流是否是初始状态
 * - 节点数量为 2
 * - 没有边
 * - 开始节点只有一个输入 或者 有两个输入，但第二个输入参数为默认状态
 * - 结束节点只有一个有效输出 或者 表单配置了多个输出变量，但都为默认状态
 */
export const getIsInitWorkflow = (
  workflowShcmaJson: WorkflowJSON,
  flowMode: WorkflowMode,
) => {
  if (!workflowShcmaJson) {
    return false;
  }
  const isInitNodesNum = workflowShcmaJson.nodes?.length === 2;
  if (!isInitNodesNum) {
    return false;
  }
  const isHasEdge = workflowShcmaJson.edges?.length;
  if (isHasEdge) {
    return false;
  }
  const initStartNode = workflowShcmaJson.nodes[0];
  const initEndNode = workflowShcmaJson.nodes[1];

  const isInitStartOuputs = getIsInitStartOuputs(initStartNode, flowMode);
  const isInitStart = !initStartNode?.edges && isInitStartOuputs;
  const isInitEnd =
    !initEndNode?.edges &&
    initEndNode?.data?.inputs?.inputParameters?.length === 1;
  return isInitStart && isInitEnd;
};
