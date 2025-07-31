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
  type IFormSchema,
  isFormSchemaPropertyEmpty,
  TestFormFieldName,
} from '@coze-workflow/test-run-next';

import type { WorkflowNodeEntity } from '../types';

interface GroupOptions {
  node: WorkflowNodeEntity;
  fnName: string;
  groupName: string;
  properties: Required<IFormSchema>['properties'];
}

const generateNodeFieldGroup = async (options: GroupOptions) => {
  const { node, fnName, groupName, properties } = options;
  const registry = node.getNodeRegistry();
  const fn = registry?.meta?.test?.[fnName];
  if (fn) {
    const group = await fn(node);
    if (!isFormSchemaPropertyEmpty(group)) {
      properties[groupName] = {
        type: 'object',
        properties: group,
      };
    }
  }
};

interface GenerateFormNodeFieldOptions {
  node: WorkflowNodeEntity;
}

export const generateFormNodeField = async ({
  node,
}: GenerateFormNodeFieldOptions) => {
  const properties = {};

  await Promise.all([
    generateNodeFieldGroup({
      node,
      fnName: 'generateFormBatchProperties',
      groupName: TestFormFieldName.Batch,
      properties,
    }),
    generateNodeFieldGroup({
      node,
      fnName: 'generateFormSettingProperties',
      groupName: TestFormFieldName.Setting,
      properties,
    }),
    generateNodeFieldGroup({
      node,
      fnName: 'generateFormInputProperties',
      groupName: TestFormFieldName.Input,
      properties,
    }),
  ]);

  if (isFormSchemaPropertyEmpty(properties)) {
    return null;
  }
  return {
    type: 'object',
    properties,
    ['x-decorator']: 'NodeFieldCollapse',
  };
};
