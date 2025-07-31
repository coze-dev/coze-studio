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

import { useEffect } from 'react';

import {
  useRefresh,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeOutputVariablesData } from '@coze-workflow/variable';

export function useRefreshOnVariableChange(node: FlowNodeEntity) {
  const refresh = useRefresh();

  const outputVariablesData: WorkflowNodeOutputVariablesData = node.getData(
    WorkflowNodeOutputVariablesData,
  );

  useEffect(() => {
    const disposable = outputVariablesData.onAnyVariablesChange(() => {
      // Refresh after variable type changes
      refresh();
    });

    return () => disposable?.dispose();
  }, [outputVariablesData, refresh]);
}
