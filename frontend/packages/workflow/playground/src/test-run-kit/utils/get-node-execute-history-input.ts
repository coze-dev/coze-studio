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

import { invert } from 'lodash-es';
import {
  safeJsonParse,
  TestFormFieldName,
  stringifyFormValuesFromBacked,
} from '@coze-workflow/test-run-next';
import { workflowApi, StandardNodeType } from '@coze-workflow/base';
import { NodeHistoryScene } from '@coze-arch/bot-api/workflow_api';

interface GetNodeExecuteHistoryInputOptions {
  workflowId: string;
  spaceId: string;
  nodeId: string;
  nodeType: string;
}

export const getNodeExecuteHistoryInput = async (
  options: GetNodeExecuteHistoryInputOptions,
) => {
  const { spaceId, workflowId, nodeId, nodeType } = options;
  const map = invert(StandardNodeType);
  const nodeTypeStr = map[nodeType];
  if (!nodeId || !nodeTypeStr) {
    return;
  }
  try {
    const res = await workflowApi.GetNodeExecuteHistory({
      workflow_id: workflowId,
      space_id: spaceId,
      node_id: nodeId,
      node_type: nodeTypeStr,
      execute_id: '',
      node_history_scene: NodeHistoryScene.TestRunInput,
    });
    const inputValues = safeJsonParse(res.data?.input);
    if (inputValues) {
      return {
        [TestFormFieldName.Node]: {
          [TestFormFieldName.Input]: stringifyFormValuesFromBacked(inputValues),
        },
      };
    }
    // eslint-disable-next-line @coze-arch/no-empty-catch
  } catch {
    //
  }
};
