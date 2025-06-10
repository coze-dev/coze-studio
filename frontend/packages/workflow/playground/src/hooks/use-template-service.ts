import { useConfigEntity } from '@flowgram-adapter/free-layout-editor';

import { WorkflowTemplateStateEntity } from '@/entities';

export const useTemplateService = () => {
  const entity = useConfigEntity<WorkflowTemplateStateEntity>(
    WorkflowTemplateStateEntity,
    true,
  );

  return entity;
};
