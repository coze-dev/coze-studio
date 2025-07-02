import { NodeExeStatus } from '@coze-arch/idl/workflow_api';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';

import { useTestRunResult } from './use-test-run-result';

interface BatchItem {
  output: string;
}

type Batch = BatchItem[];

// 获取节点调试输出
export function useTestRunOutputsValue() {
  let outputsValue;
  const testRunResult = useTestRunResult();

  if (testRunResult?.nodeStatus !== NodeExeStatus.Success) {
    return;
  }

  // 批量模式
  if (testRunResult?.batch) {
    const batch = typeSafeJSONParse(testRunResult.batch) as Batch;
    const outputList = batch.map(item => typeSafeJSONParse(item.output));

    outputsValue = {
      outputList,
    };
  } else {
    const log =
      testRunResult?.NodeType === 'End' || testRunResult?.NodeType === 'Message'
        ? testRunResult?.input
        : testRunResult?.output || '';

    outputsValue = typeSafeJSONParse(log);
  }

  return outputsValue;
}
