import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { type NodeResult, workflowApi } from '@coze-workflow/base/api';

import { typeSafeJSONParse } from '../../../utils';

interface Props {
  result: NodeResult;
  paging: number;
  spaceId: string;
  workflowId: string;
}

export default function useGetCurrentResult({
  result,
  paging,
  spaceId,
  workflowId,
}: Props) {
  const isNodeLogNeedAsync = true;
  const { batch, isBatch } = result || {};

  // 反序列化获取所有遍历数组
  const batchData: NodeResult[] = useMemo(() => {
    if (!isBatch) {
      return [];
    }
    const data = typeSafeJSONParse(batch);
    return (Array.isArray(data) ? data : []).map(i => {
      if (!i) {
        return i;
      }
      return {
        ...i,
        /** batch 数据里面不包含该标记，手动增加 */
        isBatch: true,
      };
    });
  }, [isBatch, batch]);

  // 当前执行日志（同步获取完整日志）
  const current: NodeResult | undefined = useMemo(() => {
    if (!isBatch) {
      return result;
    }

    return batchData.find(i => i?.index === paging);
  }, [paging, isBatch, batchData, result]);

  const isUseAsyncNodeResult = () => {
    if (!isNodeLogNeedAsync) {
      return false;
    }

    if (!current) {
      return false;
    }

    if (!current.needAsync) {
      return false;
    }

    return true;
  };

  const { data: currentAsync } = useQuery({
    retry: 1,
    queryKey: [
      'WorkflowApiGetNodeExecuteHistory',
      workflowId,
      spaceId,
      current?.executeId,
      current?.nodeId,
      current?.NodeType,
      isBatch,
      paging,
    ],
    queryFn: () =>
      workflowApi
        .GetNodeExecuteHistory({
          workflow_id: workflowId,
          space_id: spaceId,
          execute_id: current?.executeId || '',
          node_id: current?.nodeId || '',
          node_type: current?.NodeType || '',
          is_batch: isBatch,
          batch_index: isBatch ? paging : undefined,
        })
        .then(res => res.data)
        .catch(() => current),
    enabled: isUseAsyncNodeResult(),
  });

  return {
    current: isUseAsyncNodeResult() ? currentAsync : current,
    batchData,
  };
}
