import { useEntity } from '@flowgram-adapter/free-layout-editor';

import { WorkflowExecStateEntity } from '../entities/workflow-exec-state-entity';

export const useExecStateEntity = () => {
  const entity = useEntity<WorkflowExecStateEntity>(WorkflowExecStateEntity);

  return entity;
};
