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

import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

import { useGlobalState } from '@/hooks';

export default function useSendTea() {
  const { spaceId, projectId, workflowId } = useGlobalState();

  const handleSendTea = (
    action: string,
    info?: { id: string; category: string },
  ) => {
    sendTeaEvent(EVENT_NAMES.prompt_library_front, {
      source: projectId ? 'app_detail_page' : 'resource_library',
      prompt_id: info?.id || '',
      prompt_type:
        info?.category === 'Recommended' ? 'recommended' : 'workspace',
      action,
      space_id: spaceId,
      project_id: projectId,
      workflow_id: workflowId,
    });
  };

  return {
    handleSendTea,
  };
}
