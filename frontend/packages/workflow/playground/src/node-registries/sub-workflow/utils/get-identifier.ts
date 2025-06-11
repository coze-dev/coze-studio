import type { SubWorkflowNodeDTOData } from '../types';

export const getIdentifier = (inputs: SubWorkflowNodeDTOData['inputs']) => ({
  workflowId: inputs?.workflowId ?? '',
  workflowVersion: inputs?.workflowVersion ?? '',
});
