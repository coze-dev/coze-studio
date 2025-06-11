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
