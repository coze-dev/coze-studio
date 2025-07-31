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

import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import {
  CONVERSATION_NAME,
  type StandardNodeType,
  ValueExpression,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';

import {
  generateParametersToProperties,
  generateEnvToRelatedContextProperties,
  getRelatedInfo,
} from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  async generateRelatedContext(node, context) {
    const { isInProject, workflowId, spaceId } = context;
    const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);
    const detail = nodeData.getNodeData<StandardNodeType.SubWorkflow>();
    const isChatflowNode = detail?.flow_mode === WorkflowMode.ChatFlow;
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputData = formData?.inputs?.inputParameters || {};
    const conversationName = inputData?.[CONVERSATION_NAME];
    /** Session name with reference */
    const isConversationNameRef =
      conversationName && ValueExpression.isRef(conversationName);
    if (isInProject) {
      return generateEnvToRelatedContextProperties({
        isNeedBot: false,
        isNeedConversation: isChatflowNode && isConversationNameRef,
      });
    }
    const related = await getRelatedInfo({ workflowId, spaceId });
    if (isChatflowNode) {
      // If it is a chatflow, you must apply a selector and a session selector
      related.isNeedBot = true;
      related.isNeedConversation = true;
      // Chatflow cannot select bot as associated environment
      related.disableBot = true;
      related.disableBotTooltip = I18n.t('wf_chatflow_141');
    }
    return generateEnvToRelatedContextProperties(related);
  },
  generateFormBatchProperties(node) {
    const batchModePath = '/inputs/batchMode';
    const batchMode = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath(batchModePath);
    const path = node.getNodeMeta()?.batchPath;
    if (batchMode !== 'batch' || !path) {
      return {};
    }
    const batchData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath(path);
    return generateParametersToProperties(batchData, { node });
  },
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputDefs = formData?.inputs?.inputDefs;
    if (!inputDefs || !Array.isArray(inputDefs)) {
      return {};
    }

    const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);
    const detail = nodeData.getNodeData<StandardNodeType.SubWorkflow>();
    const isChatflowNode = detail?.flow_mode === WorkflowMode.ChatFlow;

    const inputData = formData?.inputs?.inputParameters || {};
    const inputParameters = inputDefs
      // CONVERSATION_NAME parameters in chatflow do not need to be extracted, and a dedicated session selection component is required
      .filter(i => (isChatflowNode ? i.name !== CONVERSATION_NAME : true))
      .map(i => ({
        input: inputData[i.name],
        name: i.name,
        required: i.required,
      }));

    return generateParametersToProperties(inputParameters, { node });
  },
};
