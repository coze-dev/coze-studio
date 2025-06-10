import { useCallback } from 'react';

import {
  useCurrentEntity,
  useService,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowVariableFacadeService } from '../core';

export function useGetWorkflowVariableByKeyPath() {
  const node = useCurrentEntity();
  const facadeService: WorkflowVariableFacadeService = useService(
    WorkflowVariableFacadeService,
  );

  return useCallback(
    (keyPath: string[]) =>
      facadeService.getVariableFacadeByKeyPath(keyPath, { node }),
    [node],
  );
}
