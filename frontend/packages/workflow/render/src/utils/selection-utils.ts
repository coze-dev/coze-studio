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

import { FlowNodeTransformData } from '@flowgram-adapter/free-layout-editor';
import { type SelectionService } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowNodeEntity,
  type WorkflowSelectService,
} from '@flowgram-adapter/free-layout-editor';
import { Rectangle } from '@flowgram-adapter/common';

const BOUNDS_PADDING = 2;
export function getSelectionBounds(
  selectionService: SelectionService | WorkflowSelectService,
  ignoreOneSelect?: boolean, // Ignore radio
): Rectangle {
  const selectedNodes = selectionService.selection.filter(
    node => node instanceof WorkflowNodeEntity,
  );

  // It is not displayed when a single is selected.
  return selectedNodes.length > (ignoreOneSelect ? 1 : 0)
    ? Rectangle.enlarge(
        selectedNodes.map(n => n.getData(FlowNodeTransformData)!.bounds),
      ).pad(BOUNDS_PADDING)
    : Rectangle.EMPTY;
}
