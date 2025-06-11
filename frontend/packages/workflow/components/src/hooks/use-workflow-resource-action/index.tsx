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
