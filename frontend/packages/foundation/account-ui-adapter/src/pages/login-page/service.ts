import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import { useRequest } from 'ahooks';
import { passport } from '@coze-studio/api-schema';
import {
  setUserInfo,
  useLoginStatus,
  type UserInfo,
} from '@coze-foundation/account-adapter';

export const useLoginService = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const loginService = useRequest(
    async () => {
      const res = (await passport.PassportWebEmailLoginPost({
        email,
        password,
      })) as unknown as { data: UserInfo };
      return res.data;
    },
    {
      manual: true,
      onSuccess: setUserInfo,
    },
  );

  const registerService = useRequest(
    async () => {
      const res = (await passport.PassportWebEmailRegisterV2Post({
        email,
        password,
      })) as unknown as { data: UserInfo };
      return res.data;
    },
    {
      manual: true,
      onSuccess: setUserInfo,
    },
  );

  const loginStatus = useLoginStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (loginStatus === 'logined') {
      navigate('/');
    }
  }, [loginStatus]);

  return {
    login: loginService.run,
    register: registerService.run,
    loginLoading: loginService.loading,
    registerLoading: registerService.loading,
  };
};
