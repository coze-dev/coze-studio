import { useContext } from 'react';

import type { WorkflowNode } from '../entities';
import { WorkflowNodeContext } from '../contexts';

export function useWorkflowNode() {
  const workflowNode = useContext(WorkflowNodeContext) as WorkflowNode;

  return workflowNode;
}
