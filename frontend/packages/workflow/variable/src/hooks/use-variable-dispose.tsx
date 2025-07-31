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

import { useEffect } from 'react';

import {
  useCurrentEntity,
  useService,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowVariableService } from '../legacy';

interface HooksParams {
  keyPath?: string[];
  onDispose?: () => void;
}

/**
 * @Deprecated Variable Destruction Partial Bad Case
 * - After the global variable is destroyed due to the switch Project, the variable reference will be set empty, resulting in the invalidation of the variable reference
 */
export function useVariableDispose(params: HooksParams) {
  const { keyPath, onDispose } = params;

  const node = useCurrentEntity();
  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );

  useEffect(() => {
    if (!keyPath) {
      return () => null;
    }

    const disposable = variableService.onListenVariableDispose(
      keyPath,
      () => {
        onDispose?.();
      },
      { node },
    );

    return () => disposable.dispose();
  }, [keyPath?.join('.')]);

  return;
}
