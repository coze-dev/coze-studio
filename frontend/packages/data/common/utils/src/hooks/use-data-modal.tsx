import { useState } from 'react';

import cls from 'classnames';
// import { type ModalHeight } from '@coze-arch/coze-design/types';
// import { type ButtonColor } from '@coze-arch/coze-design/types';
import {
  // type ButtonProps,
  Modal,
  type ModalProps,
} from '@coze-arch/coze-design';
import { type UseModalReturnValue } from '@coze-arch/bot-semi/src/components/ui-modal';
import { type UseModalParams, useModal } from '@coze-arch/bot-semi';

import styles from './index.module.less';
export const useDataModal = (params: UseModalParams): UseModalReturnValue => {
  const { className, ...props } = params;
  const modal = useModal({
    ...props,
    className: cls(styles['ui-data-modal'], className),
  });

  return modal;
};

export type UseModalParamsCoze = Omit<ModalProps, 'visible'> & {
  hideOkButton?: boolean;
  hideCancelButton?: boolean;
  showCloseIcon?: boolean;
  hideContent?: boolean;
  showScrollBar?: boolean;
  // okButtonColor?: ButtonColor;
};

export const useDataModalWithCoze = ({
  // type = 'info',
  centered = true,
  // height = 'fit-content',
  ...params
}: UseModalParamsCoze): UseModalReturnValue & {
  canOk: boolean;
  enableOk: () => void;
  disableOk: () => void;
} => {
  const [visible, setVisible] = useState(false);
  const [disableOk, setDisableOk] = useState(false);

  return {
    modal: inner => (
      <Modal
        closeOnEsc
        centered={Boolean(centered)}
        // height={height as ModalHeight}
        visible={visible}
        okButtonProps={{
          disabled: disableOk,
        }}
        {...(params as unknown as ModalProps)}
      >
        {inner}
      </Modal>
    ),
    open: () => setVisible(true),
    close: () => setVisible(false),
    visible,
    disableOk: () => setDisableOk(true),
    enableOk: () => setDisableOk(false),
    canOk: !disableOk,
  };
};
