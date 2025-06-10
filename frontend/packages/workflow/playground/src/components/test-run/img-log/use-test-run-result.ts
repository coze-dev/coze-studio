import { useExecStateEntity } from '../../../hooks';
import { useCurrentNode } from './use-current-node';

export function useTestRunResult() {
  const node = useCurrentNode();
  const nodeId = node.id;
  const execState = useExecStateEntity();
  const testRunResult = execState.getNodeExecResult(nodeId);

  return testRunResult;
}
