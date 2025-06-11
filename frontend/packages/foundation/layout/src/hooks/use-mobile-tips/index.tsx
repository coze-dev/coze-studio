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
