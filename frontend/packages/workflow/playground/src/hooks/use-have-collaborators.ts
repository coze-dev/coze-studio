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

import { useEffect, useState } from 'react';

import { PUBLIC_SPACE_ID } from '@coze-workflow/base/constants';
import { workflowApi } from '@coze-workflow/base';

import { useGlobalState } from './use-global-state';

// Determine if there are currently collaborators
export function useHaveCollaborators() {
  const { spaceId, workflowId } = useGlobalState();
  const [haveCollaborators, setHaveCollaborators] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    if (spaceId === PUBLIC_SPACE_ID) {
      setHaveCollaborators(false);
      return;
    }

    workflowApi
      .ListCollaborators(
        {
          workflow_id: workflowId,
          space_id: spaceId,
        },
        {
          __disableErrorToast: true,
        },
      )
      .then(({ data }) => {
        setHaveCollaborators(data.length > 1);
      });
  });

  return haveCollaborators;
}
