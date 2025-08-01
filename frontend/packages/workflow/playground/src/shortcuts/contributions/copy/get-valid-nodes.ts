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

import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import type {
  WorkflowNodeEntity,
  WorkflowNodeMeta,
} from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base';

/** Get available nodes */
export const getValidNodes = (
  nodes: WorkflowNodeEntity[],
): WorkflowNodeEntity[] =>
  nodes.filter(n => {
    if (
      [
        StandardNodeType.Start,
        StandardNodeType.End,
        FlowNodeBaseType.SUB_CANVAS,
      ].includes(n.flowNodeType as StandardNodeType)
    ) {
      return false;
    }
    if (n.getNodeMeta<WorkflowNodeMeta>().copyDisable) {
      return false;
    }
    return true;
  });
