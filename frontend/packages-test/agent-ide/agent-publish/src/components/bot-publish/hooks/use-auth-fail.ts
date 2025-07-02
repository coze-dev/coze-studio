import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { AuthStatus } from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';
import { UIModal } from '@coze-arch/bot-semi';
import { useResetLocationState } from '@coze-arch/bot-hooks';

// 三方授权失败，callback至发布页需要显式阻塞弹窗
export const useAuthFail = () => {
  const { state } = useLocation();
  const { authFailMessage = '', authStatus } = (state ??
    history.state ??
    {}) as Record<string, unknown>;

  const resetLocationState = useResetLocationState();

  useEffect(() => {
    if (authStatus === AuthStatus.Unauthorized && authFailMessage) {
      resetLocationState();

      UIModal.warning({
        title: I18n.t('bot_publish_columns_status_unauthorized'),
        content: authFailMessage as string,
        okText: I18n.t('got_it'),
        hasCancel: false,
      });
    }
  }, [authStatus, resetLocationState, authFailMessage]);
};
