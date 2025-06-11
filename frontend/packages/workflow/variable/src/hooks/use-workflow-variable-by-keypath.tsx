import {
  useCurrentEntity,
  useService,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowVariableFacadeService } from '../core';

export function useWorkflowVariableByKeyPath(keyPath?: string[]) {
  const node = useCurrentEntity();
  const facadeService: WorkflowVariableFacadeService = useService(
    WorkflowVariableFacadeService,
  );

  return facadeService.getVariableFacadeByKeyPath(keyPath, {
    node,
    checkScope: true,
  });
}
