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

/**
 * Gets which other workflows or bots are referenced by the current workflow
 * At present, bots has no data, only workflow.
 */
import {
  useQuery,
  type RefetchOptions,
  type QueryObserverResult,
} from '@tanstack/react-query';
import { type Workflow } from '@coze-workflow/base/api';

import { useWorkflowOperation } from './use-workflow-operation';
import { useGlobalState } from './use-global-state';

interface WorkflowReferences {
  workflowList: Workflow[];
}

export const useWorkflowReferences = (): {
  references: WorkflowReferences | undefined;
  refetchReferences: (options?: RefetchOptions | undefined) => Promise<
    QueryObserverResult<
      {
        workflowList: Workflow[];
      },
      Error
    >
  >;
} => {
  const { spaceId, workflowId } = useGlobalState();

  const operation = useWorkflowOperation();

  const getWorkflowReferences = async () => {
    const workflowList = await operation.getReference();

    return { workflowList };
  };

  const { data, refetch } = useQuery({
    queryKey: ['workflow_references', spaceId, workflowId],
    queryFn: getWorkflowReferences,
  });

  return {
    references: data,
    refetchReferences: refetch,
  };
};
