import { useMemo } from 'react';

import {
  useEntityFromContext,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { type StandardNodeType } from '@coze-workflow/base';

import { WorkflowPlaygroundContext } from '@/workflow-playground-context';
export function useDefaultNodeMeta() {
  const node = useEntityFromContext() as FlowNodeEntity;
  const playgroundContext = node.getService<WorkflowPlaygroundContext>(
    WorkflowPlaygroundContext,
  );

  return useMemo(() => {
    const meta = playgroundContext.getNodeTemplateInfoByType(
      node.flowNodeType as StandardNodeType,
    );
    const { nodesService } = playgroundContext as WorkflowPlaygroundContext;

    if (!meta) {
      return undefined;
    }

    return {
      ...meta,
      title: nodesService.createUniqTitle(meta.title, node),
    };
  }, []);
}
