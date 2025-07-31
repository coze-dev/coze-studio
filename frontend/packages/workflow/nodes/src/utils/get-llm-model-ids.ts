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
  type WorkflowNodeJSON,
  type WorkflowJSON,
  type WorkflowDocument,
} from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeRegistry } from '@coze-workflow/base';

/**
 * Get the large model id according to the getLLMModelIdsByNodeJSON method defined in node meta
 * @param nodeJSON
 * @param ids
 * @param document
 */
function getLLMModelIdsByNodeJSON(
  nodeJSON: WorkflowNodeJSON,
  ids: string[],
  document: WorkflowDocument,
) {
  const registry = document.getNodeRegistry(
    nodeJSON.type,
  ) as WorkflowNodeRegistry;

  const res = registry?.meta?.getLLMModelIdsByNodeJSON?.(nodeJSON);

  if (res) {
    const modelIds = Array.isArray(res) ? res : [res];
    modelIds.filter(Boolean).forEach(modelId => {
      const idstr = `${modelId}`;
      if (!ids.includes(idstr)) {
        ids.push(idstr);
      }
    });
  }

  if (nodeJSON.blocks) {
    nodeJSON.blocks.forEach(block =>
      getLLMModelIdsByNodeJSON(block, ids, document),
    );
  }
}

/**
 * Get model ids
 * @param json
 * @param document
 * @returns
 */
export function getLLMModelIds(
  json: WorkflowJSON,
  document: WorkflowDocument,
): string[] {
  const ids = [];

  if (!document) {
    return ids;
  }

  json.nodes.forEach(node => {
    getLLMModelIdsByNodeJSON(node, ids, document);
  });
  return ids;
}
