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

import {
  useCurrentEntity,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowVariableFacadeService } from '@coze-workflow/variable';

/**
 * Get the variable and verify the scope of the variable
 * @param keyPath
 * @returns
 */
export function useValidVariable(keyPath?: string[]) {
  const node = useCurrentEntity();
  const facadeService: WorkflowVariableFacadeService = useService(
    WorkflowVariableFacadeService,
  );

  const valid = !!facadeService.getVariableFacadeByKeyPath(keyPath, {
    node,
    checkScope: true,
  });
  const variable = facadeService.getVariableFacadeByKeyPath(keyPath, { node });

  return {
    valid,
    variable,
  };
}
