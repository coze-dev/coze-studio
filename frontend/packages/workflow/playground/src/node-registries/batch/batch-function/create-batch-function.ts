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

import type {
  WorkflowDocument,
  WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { type IPoint } from '@flowgram-adapter/common';
import type { WorkflowNodeJSON } from '@coze-workflow/base';

import { BatchFunctionIDPrefix } from './relation';
import { createBatchFunctionTemplateData } from './create-batch-function-template-data';
import { createBatchFunctionLines } from './create-batch-function-lines';
import { createBatchFunctionJSON } from './create-batch-function-json';

/** Create Batch loop body node */
export const createBatchFunction = async (
  batchNode: WorkflowNodeEntity,
  batchJson: WorkflowNodeJSON,
) => {
  const document = batchNode.document as WorkflowDocument;
  const id = `${BatchFunctionIDPrefix}${batchNode.id}`;
  const batchPosition: IPoint = {
    x: batchJson.meta?.position?.x || 0,
    y: batchJson.meta?.position?.y || 0,
  };
  const offset: IPoint = {
    x: 0,
    y: 200,
  };
  const position = {
    x: batchPosition.x + offset.x,
    y: batchPosition.y + offset.y,
  };
  const batchFunctionJSON = createBatchFunctionJSON(id, position);
  const batchFunctionNode = await document.createWorkflowNode(
    batchFunctionJSON,
  );
  createBatchFunctionTemplateData(batchNode, batchFunctionNode);
  createBatchFunctionLines({
    document,
    batchId: batchNode.id,
    batchFunctionId: batchFunctionNode.id,
  });
};
