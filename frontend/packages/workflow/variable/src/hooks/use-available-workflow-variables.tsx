import { useEffect, startTransition } from 'react';

import {
  ASTKind,
  type ObjectType,
  useCurrentScope,
} from '@flowgram-adapter/free-layout-editor';
import { useRefresh, useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowVariableFacadeService, type WorkflowVariable } from '../core';

export function useAvailableWorkflowVariables(): WorkflowVariable[] {
  const scope = useCurrentScope();
  const facadeService: WorkflowVariableFacadeService = useService(
    WorkflowVariableFacadeService,
  );
  const refresh = useRefresh();

  useEffect(() => {
    const disposable = scope.available.onDataChange(() => {
      startTransition(() => refresh());
    });

    return () => disposable.dispose();
  }, []);

  return scope.available.variables
    .map(_variable => {
      // 第一层为变量，因此需要分层处理
      if (_variable.type.kind === ASTKind.Object) {
        return ((_variable.type as ObjectType)?.properties || []).map(
          _property => facadeService.getVariableFacadeByField(_property),
        );
      }
      return [];
    })
    .flat();
}
