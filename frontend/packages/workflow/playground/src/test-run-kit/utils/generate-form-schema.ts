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
  TestFormFieldName,
  isFormSchemaPropertyEmpty,
} from '@coze-workflow/test-run-next';
import { PUBLIC_SPACE_ID } from '@coze-workflow/base';

import { getTestsetField } from './generate-form-schema/testset-field';
import type { WorkflowNodeEntity } from '../types';
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
   * Step1: Calculate node input
   */
  const nodeField = await generateFormNodeField(options);
  if (nodeField) {
    formSchema.properties[TestFormFieldName.Node] = nodeField;
  }

  const testset = node.getNodeRegistry().meta?.test?.testset;
  /**
   * If the test set is supported and the input is not empty, add the test set component
   */
  /* will support soon */
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
