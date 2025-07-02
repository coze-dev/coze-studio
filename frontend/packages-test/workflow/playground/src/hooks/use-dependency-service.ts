import { useConfigEntity, useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowDependencyService } from '@/services/workflow-dependency-service';
import { WorkflowDependencyStateEntity } from '@/entities';

export const useDependencyService = () =>
  useService<WorkflowDependencyService>(WorkflowDependencyService);

export const useDependencyEntity = () => {
  const entity = useConfigEntity<WorkflowDependencyStateEntity>(
    WorkflowDependencyStateEntity,
    true,
  );
  return entity;
};
