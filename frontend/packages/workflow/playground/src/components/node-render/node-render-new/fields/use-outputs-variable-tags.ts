import { useEffect } from 'react';

import {
  useCurrentEntity,
  useRefresh,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeOutputVariablesData } from '@coze-workflow/variable';
import { type OutputValueVO } from '@coze-workflow/base/types';

import { type VariableTagProps } from './variable-tag-list';
export function useOutputsVariableTags(
  outputs: OutputValueVO[] = [],
): VariableTagProps[] {
  const node = useCurrentEntity();
  const refresh = useRefresh();

  const outputVariablesData: WorkflowNodeOutputVariablesData = node.getData(
    WorkflowNodeOutputVariablesData,
  );

  const variableTags = outputs.map(
    (output): VariableTagProps => ({
      label: output.name,
      type:
        output.type ||
        outputVariablesData.getVariableByKey(output.name)?.viewType,
    }),
  );

  useEffect(() => {
    const disposable = outputVariablesData.onAnyVariablesChange(() => {
      // 变量类型变化后刷新
      refresh();
    });

    return () => disposable?.dispose();
  }, [outputVariablesData, refresh]);

  return variableTags;
}
