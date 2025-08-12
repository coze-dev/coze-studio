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

import { WorkflowNodeRefVariablesData } from '@coze-workflow/variable';
import { type IFormSchema } from '@coze-workflow/test-run-next';

import type { WorkflowNodeEntity } from '../types';
import { generateEnvToRelatedContextProperties } from './generate-env-to-related-context-properties';

interface GenerateFormRelatedFieldOptions {
  node: WorkflowNodeEntity;
  isChatflow: boolean;
  isInProject: boolean;
  spaceId: string;
  workflowId: string;
}

export const generateFormRelatedField = async ({
  node,
  isChatflow,
  isInProject,
  spaceId,
  workflowId,
}: GenerateFormRelatedFieldOptions) => {
  const registry = node.getNodeRegistry();

  let field: IFormSchema | null = null;
  if (registry?.meta?.test?.generateRelatedContext) {
    field = await registry.meta.test.generateRelatedContext(node, {
      isChatflow,
      isInProject,
      spaceId,
      workflowId,
    });
  }
  /** If the custom logic determines that the environment does not need to be selected, it is also necessary to determine the variable reference */
  if (
    !field &&
    !isInProject &&
    node.getData(WorkflowNodeRefVariablesData).hasGlobalRef
  ) {
    field = generateEnvToRelatedContextProperties({ isNeedBot: true });
  }

  return field;
};
