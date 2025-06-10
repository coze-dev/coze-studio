import {
  type IFormSchema,
  TestFormFieldName,
  isFormSchemaPropertyEmpty,
} from '@coze-workflow/test-run-next';
import { PUBLIC_SPACE_ID } from '@coze-workflow/base';

import type { WorkflowNodeEntity } from '../types';
import { getTestsetField } from './generate-form-schema/testset-field';
import { generateFormRelatedField } from './generate-form-related-field';
import { generateFormNodeField } from './generate-form-node-field';

interface GenerateFormSchemaOptions {
  node: WorkflowNodeEntity;
  workflowId: string;
  spaceId: string;
  isChatflow: boolean;
  isInProject: boolean;
  isPreview?: boolean;
}

export const generateFormSchema = async (
  options: GenerateFormSchemaOptions,
) => {
  const { node, spaceId, isPreview } = options;
  const formSchema = {
    type: 'object',
    ['x-node-id']: node.id,
    ['x-node-type']: node.flowNodeType,
    properties: {},
  };

  const relatedField = await generateFormRelatedField(options);
  if (relatedField) {
    formSchema.properties[TestFormFieldName.Related] = relatedField;
  }

  /**
   * step1: 计算节点输入
   */
  const nodeField = await generateFormNodeField(options);
  if (nodeField) {
    formSchema.properties[TestFormFieldName.Node] = nodeField;
  }

  const testset = node.getNodeRegistry().meta?.test?.testset;
  /**
   * 若支持测试集且输入不为空，则添加测试集的组件
   */
  /* The community version does not currently support testset, for future expansion */
  if (
    !IS_OPEN_SOURCE &&
    spaceId !== PUBLIC_SPACE_ID &&
    !isPreview &&
    testset &&
    !isFormSchemaPropertyEmpty(formSchema.properties)
  ) {
    Object.assign(formSchema.properties, getTestsetField());
  }

  return formSchema as IFormSchema;
};
