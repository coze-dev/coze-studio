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
