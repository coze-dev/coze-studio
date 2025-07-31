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

import { LoopFunctionIDPrefix } from './relation';
import { createLoopFunctionTemplateData } from './create-loop-function-template-data';
import { createLoopFunctionLines } from './create-loop-function-lines';
import { createLoopFunctionJSON } from './create-loop-function-json';

/** Create Loop Body Node */
export const createLoopFunction = async (
  loopNode: WorkflowNodeEntity,
  loopJson: WorkflowNodeJSON,
) => {
  const document = loopNode.document as WorkflowDocument;
  const id = `${LoopFunctionIDPrefix}${loopNode.id}`;
  const loopPosition: IPoint = {
    x: loopJson.meta?.position?.x || 0,
    y: loopJson.meta?.position?.y || 0,
  };
  const offset: IPoint = {
    x: 0,
    y: 200,
  };
  const position = {
    x: loopPosition.x + offset.x,
    y: loopPosition.y + offset.y,
  };
  const loopFunctionJSON = createLoopFunctionJSON({ id, position, loopNode });
  const loopFunctionNode = await document.createWorkflowNode(loopFunctionJSON);
  createLoopFunctionTemplateData(loopNode, loopFunctionNode);
  createLoopFunctionLines({
    document,
    loopId: loopNode.id,
    loopFunctionId: loopFunctionNode.id,
  });
};
