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

import type { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { delay } from '@flowgram-adapter/common';

/** connect generation */
export const createLoopFunctionLines = async (params: {
  document: WorkflowDocument;
  loopId: string;
  loopFunctionId: string;
}) => {
  await delay(30); // Wait for the node to be created
  const { document, loopId, loopFunctionId } = params;
  document.linesManager.createLine({
    from: loopId,
    to: loopFunctionId,
    fromPort: 'loop-output-to-function',
    toPort: 'loop-function-input',
  });
};
