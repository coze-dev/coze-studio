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

import type { DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { useParams } from 'react-router-dom';

export const useOpenWorkflowDetail = () => {
  const { bot_id: botId } = useParams<DynamicParams>();

  /** Open the process details page */
  const openWorkflowDetailPage = ({
    workflowId,
    spaceId,
    projectId,
    ideNavigate,
  }: {
    workflowId: string;
    spaceId: string;
    projectId?: string;
    ideNavigate?: (uri: string) => void;
  }) => {
    if (projectId && ideNavigate) {
      ideNavigate(`/workflow/${workflowId}?from=createSuccess`);
    } else {
      const query = new URLSearchParams();
      botId && query.append('bot_id', botId);
      query.append('space_id', spaceId ?? '');
      query.append('workflow_id', workflowId);
      query.append('from', 'createSuccess');
      window.open(`/work_flow?${query.toString()}`, '_blank');
    }
  };
  return openWorkflowDetailPage;
};
