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

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  type DatasetFCItem,
  type GetLLMNodeFCSettingDetailResponse,
  type PluginFCItem,
  workflowApi,
  type WorkflowFCItem,
} from '@coze-workflow/base/api';

import { PromiseLimiter } from '@/utils/promise-limiter';

// Limit concurrency, because there may be many LLM nodes on the same process, simultaneously requesting
const CONCURRENCY = 3;

const limiter = new PromiseLimiter(CONCURRENCY, true);

export const useQuerySettingDetail = (params: {
  workflowId: string;
  spaceId: string;
  nodeId: string;
  plugin_list?: Array<PluginFCItem>;
  workflow_list?: Array<WorkflowFCItem>;
  dataset_list?: Array<DatasetFCItem>;
  enabled?: boolean;
}): UseQueryResult<GetLLMNodeFCSettingDetailResponse> => {
  const { nodeId, enabled = true } = params;
  return useQuery({
    queryKey: [nodeId, 'settingDetail'],
    queryFn: () =>
      limiter.run(() =>
        workflowApi.GetLLMNodeFCSettingDetail({
          workflow_id: params.workflowId,
          space_id: params.spaceId,
          plugin_list: params.plugin_list,
          workflow_list: params.workflow_list,
          dataset_list: params.dataset_list,
        }),
      ),
    enabled,
  });
};
