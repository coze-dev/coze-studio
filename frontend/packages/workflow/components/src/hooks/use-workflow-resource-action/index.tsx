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

import { useWorkflowResourceMenuActions } from './use-workflow-resource-menu-actions';
import { useWorkflowResourceClick } from './use-workflow-resource-click';
import { useCreateWorkflowModal } from './use-create-workflow-modal';
import {
  type UseWorkflowResourceAction,
  type WorkflowResourceActionProps,
  type WorkflowResourceActionReturn,
} from './type';
export { useWorkflowPublishEntry } from './use-workflow-publish-entry';
export const useWorkflowResourceAction: UseWorkflowResourceAction = props => {
  const { spaceId, userId, getCommonActions } = props;
  const { handleWorkflowResourceClick, goWorkflowDetail } =
    useWorkflowResourceClick(spaceId);
  const {
    openCreateModal,
    workflowModal,
    createWorkflowModal,
    handleEditWorkflow,
  } = useCreateWorkflowModal({ ...props, goWorkflowDetail });
  const { renderWorkflowResourceActions, modals } =
    useWorkflowResourceMenuActions({
      ...props,
      userId,
      onEditWorkflowInfo: handleEditWorkflow,
      getCommonActions,
    });

  return {
    workflowResourceModals: [createWorkflowModal, workflowModal, ...modals],
    openCreateModal,
    handleWorkflowResourceClick,
    renderWorkflowResourceActions,
  };
};

export {
  type WorkflowResourceActionProps,
  type WorkflowResourceActionReturn,
  useCreateWorkflowModal,
  useWorkflowResourceClick,
  useWorkflowResourceMenuActions,
};
