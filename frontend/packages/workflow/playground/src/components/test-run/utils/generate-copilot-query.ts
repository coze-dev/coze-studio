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

import { ValueExpressionType } from '@coze-workflow/base';
import {
  type WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

interface CopilotGenerateItem {
  type: string;
  required: boolean;
  name: string;
  schema?: CopilotGenerateItem[] | CopilotGenerateItem;
}

/**
 * Generate copilot queries
 * @param node
 * @returns
 */
export async function generateCopilotQuery(
  node: WorkflowNodeEntity,
): Promise<string> {
  const nodeJSON = await (node.document as WorkflowDocument).toNodeJSON(node);

  const items = (nodeJSON?.data?.inputs?.inputParameters || [])
    .map(({ name, input }) => {
      if (
        !name ||
        !input?.type ||
        input?.assistType ||
        input?.schema?.assistType ||
        input?.value?.type !== ValueExpressionType.REF
      ) {
        return null;
      }

      const item: CopilotGenerateItem = {
        name,
        type: input.type,
        required: true,
      };

      if (input?.schema) {
        item.schema = input.schema;
      }

      return item;
    })
    .filter(Boolean) as CopilotGenerateItem[];

  return JSON.stringify(items);
}
