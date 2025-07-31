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

import { get, set } from 'lodash-es';
import { type WorkflowNodeFormMeta } from '@flowgram-adapter/free-layout-editor';
import { variableUtils } from '@coze-workflow/variable';
import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_NODE_SIZE,
  type WorkflowNodeRegistry,
} from '@coze-workflow/nodes';
import {
  StandardNodeType,
  ValueExpression,
  type VariableTypeDTO,
  ViewVariableType,
  type NodeMeta,
  type InputValueDTO,
  type RefExpressionContent,
} from '@coze-workflow/base';
const NODE_WIDTH = DEFAULT_NODE_SIZE.width;
const NODE_HEIGHT = 113;
const INPUT_PATH = '/inputParameters';

const helpLinkMap = {
  [StandardNodeType.ClearContext]:
    '/open/docs/guides/clear_conversation_history',
  [StandardNodeType.CreateConversation]:
    '/open/docs/guides/create_conversation',
  [StandardNodeType.QueryMessageList]: '/open/docs/guides/query_message_list',
  [StandardNodeType.UpdateConversation]: '/open/docs/guides/edit_conversation',
  [StandardNodeType.DeleteConversation]:
    '/open/docs/guides/delete_conversation',
  [StandardNodeType.QueryConversationList]:
    '/open/docs/guides/query_conversation_list',
  [StandardNodeType.QueryConversationHistory]:
    '/open/docs/guides/query_conversation_history',
  [StandardNodeType.CreateMessage]: '/open/docs/guides/create_message',
  [StandardNodeType.UpdateMessage]: '/open/docs/guides/edit_message',
  [StandardNodeType.DeleteMessage]: '/open/docs/guides/delete_message',
};

export const createNodeRegistry = (
  nodeType: StandardNodeType,
  formMeta: WorkflowNodeFormMeta,
  fieldConfig: Record<
    string,
    {
      description: string;
      name: string;
      required: boolean;
      type: string;
    }
  >,
  nodeMeta?: Partial<NodeMeta>,
  // eslint-disable-next-line max-params
): WorkflowNodeRegistry => ({
  type: nodeType,
  meta: {
    nodeDTOType: nodeType,
    style: {
      width: NODE_WIDTH,
    },
    size: { width: NODE_WIDTH, height: NODE_HEIGHT },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    inputParametersPath: INPUT_PATH, // Imported parameter path, practice running and other functions rely on this path to extract parameters
    getInputVariableTag(name, input, extra) {
      const field = fieldConfig[name || ''];

      let invalid = false;

      if (field?.required) {
        const content = input?.content as RefExpressionContent;
        const isRef = content?.keyPath?.length > 0;

        // When initializing the process, it is possible that the variable module has not been initialized, and the variable will not be obtained here...
        const variable = extra?.variableService.getWorkflowVariableByKeyPath(
          content?.keyPath,
          { node: extra?.node, checkScope: true },
        );

        // Required scene if:
        // 1. Empty, error reported
        // 2. Not empty
        //   2.1 Reference to a variable, and the variable does not exist, an error is reported
        invalid = ValueExpression.isEmpty(input) || (isRef && !variable);
      }

      return {
        label: name,
        type: field?.type
          ? variableUtils.DTOTypeToViewType(field.type as VariableTypeDTO)
          : ViewVariableType.String,
        invalid,
      };
    },
    helpLink: helpLinkMap[nodeType],
    ...nodeMeta,
  },
  beforeNodeSubmit: nodeData => {
    const inputParameters = get(
      nodeData,
      'data.inputs.inputParameters',
      [],
    ) as InputValueDTO[];

    // For fixed parameter types, you need to set the type field to a predefined type, rather than the variable type populated on the right
    inputParameters.forEach(param => {
      const config = fieldConfig[param.name || ''];
      if (config && param.input.type) {
        set(param, 'input.type', config.type);
      }
    });

    return nodeData;
  },
  formMeta,
});
