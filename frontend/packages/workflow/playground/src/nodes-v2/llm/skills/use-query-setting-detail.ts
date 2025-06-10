import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  type DatasetFCItem,
  type GetLLMNodeFCSettingDetailResponse,
  type PluginFCItem,
  workflowApi,
  type WorkflowFCItem,
} from '@coze-workflow/base/api';

import { PromiseLimiter } from '@/utils/promise-limiter';

// 限制并发，因为同一个流程上可能会有很多LLM节点，同时请求
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
