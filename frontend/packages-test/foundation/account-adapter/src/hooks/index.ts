import { useLocation, useNavigate } from 'react-router-dom';

import { useCheckLoginBase } from '@coze-foundation/account-base';

import { signPath, signRedirectKey } from '../utils/constants';
import { checkLoginImpl } from '../utils';

const useGoLogin = (loginFallbackPath?: string) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  return () => {
    const redirectPath = `${pathname}${search}`;
    if (loginFallbackPath) {
      navigate(`${loginFallbackPath}${search}`, { replace: true });
    } else {
      navigate(
        `${signPath}?${signRedirectKey}=${encodeURIComponent(redirectPath)}`,
      );
    }
  };
};

export const useCheckLogin = ({
  needLogin,
  loginFallbackPath,
}: {
  needLogin?: boolean;
  loginFallbackPath?: string;
}) => {
  const goLogin = useGoLogin(loginFallbackPath);
  useCheckLoginBase(!!needLogin, checkLoginImpl, goLogin);
};
