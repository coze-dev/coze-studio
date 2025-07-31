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

import { PositionData } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowNodeJSON,
  WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { type IPoint } from '@flowgram-adapter/common';

/**
 * Get node coordinates
 * @param node
 * @returns
 */
export function getNodePoint(
  node: WorkflowNodeEntity | WorkflowNodeJSON,
): IPoint {
  if (node instanceof WorkflowNodeEntity) {
    const positionData = node.getData<PositionData>(PositionData);
    return {
      x: positionData.x,
      y: positionData.y,
    };
  }

  return node?.meta?.position || { x: 0, y: 0 };
}
