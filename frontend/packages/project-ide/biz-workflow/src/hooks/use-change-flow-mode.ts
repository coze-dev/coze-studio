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
  useIDENavigate,
  getURIByResource,
  useProjectIDEServices,
} from '@coze-project-ide/framework';
import { usePrimarySidebarStore } from '@coze-project-ide/biz-components';
import { I18n } from '@coze-arch/i18n';
import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';
import { workflowApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';
export const useChangeFlowMode = () => {
  const refetch = usePrimarySidebarStore(state => state.refetch);
  const navigate = useIDENavigate();
  const { view } = useProjectIDEServices();

  return async (
    flowMode: WorkflowMode,
    workflowId: string,
    spaceId: string,
  ) => {
    await workflowApi.UpdateWorkflowMeta({
      workflow_id: workflowId,
      space_id: spaceId,
      flow_mode: flowMode,
    });
    Toast.success(
      I18n.t('wf_chatflow_123', {
        Chatflow: I18n.t(
          flowMode === WorkflowMode.ChatFlow ? 'wf_chatflow_76' : 'Workflow',
        ),
      }),
    );
    await refetch();
    const uri = getURIByResource('workflow', workflowId);
    const widgetContext = view.getWidgetContextFromURI(uri);
    const widgetOpened = Boolean(widgetContext?.widget);
    // For widgets that have been opened, add the refresh parameter to refresh. If they are not opened, they will be refreshed if they are opened directly.
    navigate(`/workflow/${workflowId}${widgetOpened ? '?refresh=true' : ''}`);
  };
};
