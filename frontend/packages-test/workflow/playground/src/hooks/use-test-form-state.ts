import { useConfigEntity } from '@flowgram-adapter/free-layout-editor';

import { WorkflowTestFormStateEntity } from '../entities';

export const useTestFormState = () => {
  const entity = useConfigEntity<WorkflowTestFormStateEntity>(
    WorkflowTestFormStateEntity,
    true,
  );

  return entity;
};
