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

import type { FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  useService,
  usePlayground,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowSelectService } from '@flowgram-adapter/free-layout-editor';

export const useScrollToNode = () => {
  const selectServices = useService<WorkflowSelectService>(
    WorkflowSelectService,
  );

  const playground = usePlayground();

  const scrollToNode = async (nodeId: string) => {
    let success = false;
    const node = playground.entityManager.getEntityById<FlowNodeEntity>(nodeId);

    if (node) {
      await selectServices.selectNodeAndScrollToView(node, true);
      success = true;
    }
    return success;
  };

  return scrollToNode;
};
