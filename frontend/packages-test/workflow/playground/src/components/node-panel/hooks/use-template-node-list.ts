import {
  type WorkflowNodeEntity,
  type WorkflowNodeMeta,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import {
  getEnabledNodeTypes,
  useSupportImageflowNodesQuery,
} from '@coze-workflow/base-adapter';
import { StandardNodeType } from '@coze-workflow/base';

import { WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { type NodeCategory } from '@/typing';
import { useGetWorkflowMode, useGlobalState } from '@/hooks';

const getLoopSelected = (containerNode?: WorkflowNodeEntity) => {
  if (!containerNode) {
    return false;
  }
  const containerSubCanvas = containerNode
    .getNodeMeta<WorkflowNodeMeta>()
    .subCanvas?.(containerNode);
  if (
    containerSubCanvas?.isCanvas &&
    containerSubCanvas.parentNode.flowNodeType === StandardNodeType.Loop
  ) {
    return true;
  }
  return false;
};

export const useTemplateNodeList = (
  containerNode?: WorkflowNodeEntity,
): NodeCategory[] => {
  const loopSelected = getLoopSelected(containerNode);

  const context = useService<WorkflowPlaygroundContext>(
    WorkflowPlaygroundContext,
  );

  const { isSceneFlow } = useGetWorkflowMode();
  const { projectId, isBindDouyin } = useGlobalState();
  const { isSupportImageflowNodes } = useSupportImageflowNodesQuery();

  const nodeCategoryList = context.getTemplateCategoryList(
    getEnabledNodeTypes({
      loopSelected,
      isSceneFlow,
      isProject: Boolean(projectId),
      isSupportImageflowNodes,
      isBindDouyin: Boolean(isBindDouyin),
    }),
    isSupportImageflowNodes,
  );

  return nodeCategoryList;
};
