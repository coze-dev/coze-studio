import { useEffect } from 'react';

import { localStorageService } from '@coze-foundation/local-storage';

import { useLoginStatus, useUserInfo } from './index';

export const useSyncLocalStorageUid = () => {
  const userInfo = useUserInfo();
  const loginStatus = useLoginStatus();

  useEffect(() => {
    if (loginStatus === 'logined') {
      localStorageService.setUserId(userInfo?.user_id_str);
    }
    if (loginStatus === 'not_login') {
      localStorageService.setUserId();
    }
  }, [loginStatus, userInfo?.user_id_str]);
};
