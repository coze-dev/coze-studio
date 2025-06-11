import { useRef } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze/coze-design';
import { useAlterOnLogout as useAlertOnLogoutImpl } from '@coze-foundation/account-adapter';

export const useAlertOnLogout = () => {
  const alertRef = useRef(false);

  const callback = () => {
    if (alertRef.current) {
      return;
    }
    alertRef.current = true;
    Modal.confirm({
      title: I18n.t('account_update_hint'),
      okText: I18n.t('api_analytics_refresh'),
      closeOnEsc: false,
      maskClosable: false,
      onOk: () => {
        window.location.reload();
      },
    });
  };
  useAlertOnLogoutImpl(callback);
};
