import { useEffect, useState } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowSelectService } from '@flowgram-adapter/free-layout-editor';

/**
 * 选中节点
 */
export function useSelectedNodes() {
  const selectService = useService<WorkflowSelectService>(
    WorkflowSelectService,
  );

  const [selectedNodes, setSelectedNodes] = useState(
    selectService.selectedNodes,
  );

  useEffect(() => {
    const disposable = selectService.onSelectionChanged(() => {
      setSelectedNodes(selectService.selectedNodes);
    });

    return () => {
      disposable.dispose();
    };
  });

  return {
    selectedNodes,
  };
}
