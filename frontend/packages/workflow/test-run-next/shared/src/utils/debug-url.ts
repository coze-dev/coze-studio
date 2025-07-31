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

interface DebugUrlParams {
  spaceId: string;
  workflowId: string;
  executeId: string;
  nodeId?: string;
  subExecuteId?: string;
}

/**
 * Calculate DebugUrl
 */
const getDebugUrl = (params: DebugUrlParams) => {
  const { spaceId, workflowId, executeId, subExecuteId, nodeId } = params;
  const search = new URLSearchParams({
    space_id: spaceId,
    workflow_id: workflowId,
    execute_id: executeId,
    node_id: nodeId || '',
    sub_execute_id: subExecuteId || '',
  });
  return `/work_flow?${search.toString()}`;
};

export const gotoDebugFlow = (params: DebugUrlParams, op?: boolean) => {
  if (op) {
    const { workflowId, executeId, subExecuteId, nodeId } = params;
    const search = new URLSearchParams({
      workflow_id: workflowId,
      execute_id: executeId,
      node_id: nodeId || '',
      sub_execute_id: subExecuteId || '',
    });
    window.open(`${window.location.pathname}?${search.toString()}`);
  }
  const url = getDebugUrl(params);
  window.open(url);
};
