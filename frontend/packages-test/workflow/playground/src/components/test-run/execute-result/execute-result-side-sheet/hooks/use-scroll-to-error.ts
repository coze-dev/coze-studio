/* eslint-disable @coze-arch/no-deep-relative-import */
import { useScrollToNode, useScrollToLine } from '../../../../../hooks';
import { type NodeError } from '../../../../../entities/workflow-exec-state-entity';

export const useScrollToError = () => {
  const scrollToNode = useScrollToNode();
  const scrollToLine = useScrollToLine();

  const scrollToError = (error: NodeError) => {
    const { nodeId, errorType, targetNodeId } = error;
    if (errorType === 'line') {
      return scrollToLine(nodeId, targetNodeId || '');
    } else {
      return scrollToNode(nodeId);
    }
  };

  return scrollToError;
};
