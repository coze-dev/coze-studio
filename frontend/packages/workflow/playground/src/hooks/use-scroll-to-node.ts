import type { FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { useService, usePlayground } from '@flowgram-adapter/free-layout-editor';
import { WorkflowSelectService } from '@flowgram-adapter/free-layout-editor';

export const useScrollToNode = () => {
  const selectServices = useService<WorkflowSelectService>(
    WorkflowSelectService,
  );

  const playground = usePlayground();

  const scrollToNode = async (nodeId: string) => {
    let success = false;
    const node = playground.entityManager.getEntityById<FlowNodeEntity>(nodeId);

    if (node) {
      await selectServices.selectNodeAndScrollToView(node, true);
      success = true;
    }
    return success;
  };

  return scrollToNode;
};
