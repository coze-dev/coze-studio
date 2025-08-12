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

import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { useUIModal } from '@coze-arch/bot-semi';

import s from './index.module.less';

export interface UseMobileTipsReturnType {
  open: () => void;
  close: () => void;
  node: JSX.Element;
}

export const useMobileTips = (): UseMobileTipsReturnType => {
  const { open, close, modal } = useUIModal({
    title: I18n.t('landing_mobile_popup_title'),
    okText: I18n.t('landing_mobile_popup_button'),
    // width: 456,
    centered: true,
    hideCancelButton: true,
    isMobile: true,
    onOk: () => {
      close();
    },
  });

  return {
    node: modal(
      <span className={s['mobile-tips-span']}>
        {I18n.t('landing_mobile_popup_context')}
      </span>,
    ),
    open: () => {
      open();
    },
    close: () => {
      close();
    },
  };
};
