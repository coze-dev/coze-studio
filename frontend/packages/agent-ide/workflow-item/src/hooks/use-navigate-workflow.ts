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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

export function useNavigateWorkflowOrBlockwise({
  spaceID,
  onNavigate2Edit,
}: Record<string, any>) {
  const navigateToWorkflow = useCallback(
    (workflowId?: string) => {
      if (!workflowId || workflowId === '0') {
        // Indicates dirty data, prompt and block the click event
        Toast.warning({
          content: I18n.t('workflow_error_jump_tip'),
          showClose: false,
        });
        return;
      } else {
        onNavigate2Edit(workflowId);
      }
    },
    [spaceID],
  );

  return {
    navigateToWorkflow,
  };
}
