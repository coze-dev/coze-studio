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
