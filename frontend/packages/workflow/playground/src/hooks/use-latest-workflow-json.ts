import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  type WorkflowJSON,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowSaveService } from '../services';

export const useLatestWorkflowJson = () => {
  const workflowDocument = useService<WorkflowDocument>(WorkflowDocument);

  const saveService = useService<WorkflowSaveService>(WorkflowSaveService);

  const getLatestWorkflowJson = async (): Promise<WorkflowJSON> => {
    await saveService.waitSaving();

    return workflowDocument.toJSON() as WorkflowJSON;
  };

  return { getLatestWorkflowJson };
};
