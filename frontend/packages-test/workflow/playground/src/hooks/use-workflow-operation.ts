import { useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowOperationService } from '../services';

export const useWorkflowOperation = () => {
  const operation = useService<WorkflowOperationService>(
    WorkflowOperationService,
  );

  return operation;
};
