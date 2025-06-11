import { useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowLinesService } from '../services/workflow-line-service';

export const useLineService = () => {
  const lineService = useService<WorkflowLinesService>(WorkflowLinesService);

  return lineService;
};
