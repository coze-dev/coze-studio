import { useState } from 'react';

import { type ShortcutEditModalProps, ShortcutEditModal } from './modal';

export { ShortcutEditModal, ShortcutEditModalProps };

export const useShortcutEditModal = (
  props: Omit<ShortcutEditModalProps, 'onClose'>,
) => {
  const [visible, setVisible] = useState(false);
  const close = () => {
    setVisible(false);
    props.setErrorMessage('');
  };
  const open = () => {
    setVisible(true);
  };
  return {
    node: visible ? <ShortcutEditModal {...props} onClose={close} /> : null,
    close,
    open,
  };
};
