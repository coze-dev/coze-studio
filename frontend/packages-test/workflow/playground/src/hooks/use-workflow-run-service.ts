import { useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowRunService } from '../services';

export const useWorkflowRunService = () =>
  useService<WorkflowRunService>(WorkflowRunService);
