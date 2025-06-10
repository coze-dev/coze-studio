import { useState } from 'react';

import { Modal, type ModalProps } from '@coze/coze-design';

export type UseModalParams = Omit<ModalProps, 'visible'>;

export interface UseModalReturnValue {
  modal: (inner: JSX.Element) => JSX.Element;
  open: () => void;
  close: () => void;
}

export const useModal = (params: UseModalParams): UseModalReturnValue => {
  const [visible, setVisible] = useState(false);

  return {
    modal: inner => (
      <Modal {...params} visible={visible}>
        {inner}
      </Modal>
    ),
    open: () => setVisible(true),
    close: () => setVisible(false),
  };
};
