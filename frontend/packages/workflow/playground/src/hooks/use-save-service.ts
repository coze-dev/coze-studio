import { useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowSaveService } from '@/services';

export const useSaveService = () =>
  useService<WorkflowSaveService>(WorkflowSaveService);
