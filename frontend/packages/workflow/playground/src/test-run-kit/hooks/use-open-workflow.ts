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

/** Pick from master, if there is any conflict, please refer to master */
import { useGlobalState } from '@/hooks';

/**
 * Open workflow
 * TODO: Some dependencies have not been migrated yet. For the time being, put this hook here first, and you need to migrate later.
 */
export const useOpenWorkflow = () => {
  const { projectId, getProjectApi } = useGlobalState();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const open = (data: any) => {
    const { workflowId, executeId, subExecuteId } = data;
    const projectApi = getProjectApi();

    if (projectId && projectApi) {
      // in-app jump
      projectApi.sendMsgOpenWidget(`/workflow/${workflowId}`, {
        name: 'debug',
        data: {
          executeId,
          subExecuteId,
        },
      });
    } else {
      // Resource library or operation and maintenance platform jump
      const url = new URL(window.location.href);
      const params = new URLSearchParams();

      // Add/update query parameters to keep only these 4 parameters, including space_id
      params.append('space_id', url.searchParams.get('space_id') || '0');
      params.append('workflow_id', workflowId);
      params.append('execute_id', executeId);
      params.append('sub_execute_id', subExecuteId);

      // Build a new URL
      url.search = params.toString();

      // Open in a new tab
      window.open(url.toString(), '_blank');
    }
  };

  return { open };
};
