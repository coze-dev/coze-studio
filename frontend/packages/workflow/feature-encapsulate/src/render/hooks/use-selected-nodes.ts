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

import { useEffect, useState } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowSelectService } from '@flowgram-adapter/free-layout-editor';

/**
 * selected node
 */
export function useSelectedNodes() {
  const selectService = useService<WorkflowSelectService>(
    WorkflowSelectService,
  );

  const [selectedNodes, setSelectedNodes] = useState(
    selectService.selectedNodes,
  );

  useEffect(() => {
    const disposable = selectService.onSelectionChanged(() => {
      setSelectedNodes(selectService.selectedNodes);
    });

    return () => {
      disposable.dispose();
    };
  });

  return {
    selectedNodes,
  };
}
