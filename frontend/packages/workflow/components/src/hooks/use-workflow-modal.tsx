import { type ReactNode } from 'react';

import { useBoolean } from 'ahooks';

import { type WorkFlowModalModeProps } from '../workflow-modal/type';
import WorkflowModal from '../workflow-modal';

interface UseWorkFlowListReturnValue {
  node: ReactNode;
  open: () => void;
  close: () => void;
}

export const useWorkflowModal = (
  props?: WorkFlowModalModeProps,
): UseWorkFlowListReturnValue => {
  const { onClose, ...restProps } = props || {};
  const [visible, { setTrue: showModal, setFalse: hideModal }] =
    useBoolean(false);
  const closeModal = () => {
    onClose?.();
    hideModal();
  };
  return {
    node: visible ? (
      <WorkflowModal visible onClose={closeModal} {...restProps} />
    ) : null,
    close: closeModal,
    open: showModal,
  };
};
