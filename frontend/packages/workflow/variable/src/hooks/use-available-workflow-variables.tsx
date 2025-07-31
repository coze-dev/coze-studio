/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
      // The first layer is a variable, so it requires hierarchical processing
      if (_variable.type.kind === ASTKind.Object) {
        return ((_variable.type as ObjectType)?.properties || []).map(
          _property => facadeService.getVariableFacadeByField(_property),
        );
      }
      return [];
    })
    .flat();
}
