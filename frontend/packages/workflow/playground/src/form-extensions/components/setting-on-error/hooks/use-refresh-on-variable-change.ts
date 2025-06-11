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
      // 变量类型变化后刷新
      refresh();
    });

    return () => disposable?.dispose();
  }, [outputVariablesData, refresh]);
}
