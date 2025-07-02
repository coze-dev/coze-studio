import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { AuthStatus } from '@coze-arch/idl/developer_api';
import { useResetLocationState } from '@coze-arch/bot-hooks';

// 三方授权成功，调用成功回调
export const useAuthSuccess = (bindSuccess: (id: string) => void) => {
  const { state } = useLocation();
  const { oauth2, authStatus } = (state ?? history.state ?? {}) as Record<
    string,
    unknown
  >;
  const { platform = '' } = (oauth2 ?? {}) as Record<string, string>;
  const resetLocationState = useResetLocationState();

  useEffect(() => {
    if (authStatus === AuthStatus.Authorized) {
      resetLocationState();

      bindSuccess(platform);
    }
  }, [platform, authStatus]);
};
