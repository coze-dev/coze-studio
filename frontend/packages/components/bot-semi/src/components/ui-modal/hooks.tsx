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

import { ModalReactProps } from '@douyinfe/semi-ui/lib/es/modal/';

import { UIModal, UIModalType } from './ui-modal';
import { UIMobileModal } from './ui-mobile-modal';

export type UseModalParams = Omit<ModalReactProps, 'visible'> & {
  type?: UIModalType;
  hideOkButton?: boolean;
  hideCancelButton?: boolean;
  showCloseIcon?: boolean;
  hideContent?: boolean;
  isMobile?: boolean;
  showScrollBar?: boolean;
};

export interface UseModalReturnValue {
  modal: (inner: JSX.Element) => JSX.Element;
  open: () => void;
  close: () => void;
  visible: boolean;
}

export const useModal = ({
  type = 'info',
  centered = true,
  isMobile = false,
  ...params
}: UseModalParams): UseModalReturnValue => {
  const [visible, setVisible] = useState(false);

  return {
    modal: inner =>
      isMobile ? (
        <UIMobileModal
          type={type}
          centered={centered}
          {...params}
          visible={visible}
        >
          {inner}
        </UIMobileModal>
      ) : (
        <UIModal type={type} centered={centered} {...params} visible={visible}>
          {inner}
        </UIModal>
      ),
    open: () => setVisible(true),
    close: () => setVisible(false),
    visible,
  };
};
