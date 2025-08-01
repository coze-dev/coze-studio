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
import {
  generateInputJsonSchema,
  ViewVariableType,
} from '@coze-workflow/variable';
import { getSortedInputParameters } from '@coze-workflow/nodes';

import {
  generateField,
  type IFormSchema,
  getRelatedInfo,
  generateEnvToRelatedContextProperties,
  type NodeTestMeta,
} from '@/test-run-kit';

export const test: NodeTestMeta = {
  testset: true,
  async generateRelatedContext(node, context) {
    const { spaceId, workflowId, isChatflow, isInProject } = context;
    // No need to associate in the project
    if (isInProject) {
      return generateEnvToRelatedContextProperties({
        isNeedBot: false,
      });
    }
    const related = await getRelatedInfo({ spaceId, workflowId });

    /**
     * Full process testing without selecting a session
     * 1. The workflow itself does not require
     * 2. chatflow selects the session in the session component, no need to select in the form
     */
    related.isNeedConversation = false;
    /** Chatflow that is not in the project forces the need for an associated environment */
    if (isChatflow && !isInProject) {
      related.isNeedBot = true;
    }
    return generateEnvToRelatedContextProperties(related);
  },
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputParameters = (formData?.outputs || [])
      .filter(i => !i.isPreset)
      .map(item => {
        const variable =
          node.context.variableService.getWorkflowVariableByKeyPath([
            node.id,
            item.name,
          ]);
        const { dtoMeta } = variable;
        const jsonSchema = generateInputJsonSchema(dtoMeta);
        return {
          name: item.name,
          title: item.name,
          type: variable.viewType || ViewVariableType.String,
          defaultValue: item.defaultValue,
          description: item.description,
          required: item.required,
          validateJsonSchema: jsonSchema,
          extra: {
            ['x-dto-meta']: dtoMeta,
          },
        };
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties: IFormSchema['properties'] = getSortedInputParameters<any>(
      inputParameters,
    ).reduce((value, item) => {
      if (item.name) {
        value[item.name] = generateField(item);
      }
      return value;
    }, {});
    return properties;
  },
};
