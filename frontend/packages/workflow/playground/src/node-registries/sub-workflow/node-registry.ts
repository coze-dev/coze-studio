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
 
import { cloneDeep } from 'lodash-es';
import {
  type FlowNodeEntity,
  FlowNodeFormData,
  type FormModelV2,
  PlaygroundContext,
} from '@flowgram-adapter/free-layout-editor';
import {
  DEFAULT_BATCH_PATH,
  DEFAULT_NODE_META_PATH,
  DEFAULT_OUTPUTS_PATH,
  WorkflowNodeData,
} from '@coze-workflow/nodes';
import {
  CONVERSATION_NAME,
  StandardNodeType,
  ValueExpression,
  WorkflowMode,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { type WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { type NodeTestMeta } from '@/test-run-kit';

import { getIdentifier } from './utils';
import type { SubWorkflowNodeDTOData } from './types';
import { SubWorkflowNodeService } from './services';
import { test } from './node-test';
import { SUB_WORKFLOW_FORM_META } from './form-meta';
import { INPUT_PATH } from './constants';
import { createSubWorkflowLink } from './components';

const getSubWorkflowService = (context: WorkflowPlaygroundContext) =>
  context.entityManager.getService<SubWorkflowNodeService>(
    SubWorkflowNodeService,
  );

export const SUB_WORKFLOW_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.SubWorkflow,
  meta: {
    nodeDTOType: StandardNodeType.SubWorkflow,
    size: { width: 360, height: 130.7 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    batchPath: DEFAULT_BATCH_PATH,
    inputParametersPath: INPUT_PATH, // 入参路径，试运行等功能依赖该路径提取参数
    test,
    helpLink: '/open/docs/guides/workflow_node',
  },
  formMeta: SUB_WORKFLOW_FORM_META,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInit: async (nodeJson: any, context: WorkflowPlaygroundContext) => {
    if (!nodeJson) {
      return;
    }

    const { inputs, nodeMeta } = nodeJson.data || nodeJson;
    const subWorkflowService = getSubWorkflowService(context);
    const identifier = getIdentifier(inputs);
    await subWorkflowService.load(identifier, nodeMeta?.title);
  },

  checkError: (nodeJson, context: WorkflowPlaygroundContext) => {
    if (!nodeJson) {
      return undefined;
    }

    const { inputs } = nodeJson.data || nodeJson;
    const subWorkflowService = getSubWorkflowService(context);
    const identifier = getIdentifier(inputs);
    return subWorkflowService.getApiError(identifier);
  },

  onDispose: (nodeJson, context: WorkflowPlaygroundContext) => {
    if (!nodeJson) {
      return;
    }
    const { inputs } = nodeJson.data || nodeJson;
    const subWorkflowService = getSubWorkflowService(context);
    const identifier = getIdentifier(inputs);
    subWorkflowService.clearApiError(identifier);
  },

  getHeaderExtraOperation: (
    formValues: SubWorkflowNodeDTOData,
    node: FlowNodeEntity,
  ) => {
    const identifier = getIdentifier(formValues?.inputs ?? []);

    const subWorkflowService = node.getService<SubWorkflowNodeService>(
      SubWorkflowNodeService,
    );
    const subWorkflow = subWorkflowService.getApiDetail(identifier);
    return createSubWorkflowLink(subWorkflow, identifier);
  },

  onCreate(node: FlowNodeEntity, _json: unknown) {
    const formModel = node
      .getData(FlowNodeFormData)
      .getFormModel<FormModelV2>();
    const playgroundContext =
      node.getService<PlaygroundContext>(PlaygroundContext);
    const { variableService, nodesService } = playgroundContext;
    const startNode = nodesService.getStartNode();

    const DELAY_TIME = 1000;
    setTimeout(() => {
      if (!node) {
        return;
      }

      const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);
      const subWorkflowDetail =
        nodeData?.getNodeData<StandardNodeType.SubWorkflow>();

      const nodeIsChatflow =
        subWorkflowDetail?.flow_mode === WorkflowMode.ChatFlow;

      const startConversationNameVar =
        variableService.getWorkflowVariableByKeyPath(
          [startNode.id, CONVERSATION_NAME],
          {
            node,
            checkScope: true,
          },
        );

      // 如果能够找到开始节点的 CONVERSATION_NAME 参数
      if (startConversationNameVar && nodeIsChatflow && formModel) {
        const inputParameters = formModel.getValueIn('inputs.inputParameters');
        if (inputParameters) {
          const originValue = cloneDeep(inputParameters);

          if (
            originValue[CONVERSATION_NAME] &&
            ValueExpression.isEmpty(originValue[CONVERSATION_NAME])
          ) {
            // 如果 CONVERSATION_NAME 为空，才回填
            originValue[CONVERSATION_NAME] = {
              type: 'ref',
              content: {
                keyPath: [startNode.id, CONVERSATION_NAME],
              },
            };

            formModel.setValueIn('inputs.inputParameters', originValue);
          }
        }
      }
      // 这个延时时间需要比较长，暂时先设置为 1s
    }, DELAY_TIME);
  },
};
