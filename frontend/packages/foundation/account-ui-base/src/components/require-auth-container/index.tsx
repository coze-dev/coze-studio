import { type PropsWithChildren, type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { UIButton } from '@coze-arch/bot-semi';
import {
  useHasError,
  checkLogin,
  useLoginStatus,
} from '@coze-foundation/account-adapter';

import { LoadingContainer } from '../loading-container';

interface ErrorPageProps {
  onRetry: () => void;
}

const ErrorContainer: FC<ErrorPageProps> = ({ onRetry }) => (
  <div className="w-full h-full flex items-center justify-center flex-col">
    {I18n.t('login_failed')}
    <UIButton onClick={onRetry}>{I18n.t('Retry')}</UIButton>
  </div>
);

const Mask: FC<PropsWithChildren> = ({ children }) => (
  <div className="z-1 absolute bg-[#F7F7FA] w-full h-full left-0 top-0">
    {children}
  </div>
);

// 在需要时渲染错误状态 & loading
const LoginCheckMask: FC<{ needLogin: boolean; loginOptional: boolean }> = ({
  needLogin,
  loginOptional,
}) => {
  const loginStatus = useLoginStatus();
  const isLogined = loginStatus === 'logined';
  const hasError = useHasError();
  if (hasError && needLogin) {
    return (
      <Mask>
        <ErrorContainer onRetry={checkLogin} />;
      </Mask>
    );
  }

  if (needLogin && !loginOptional && !isLogined) {
    return (
      <Mask>
        <LoadingContainer />
      </Mask>
    );
  }
  return null;
};

// TODO 定位 & 组件名需要调整
export const RequireAuthContainer: FC<
  PropsWithChildren<{ needLogin: boolean; loginOptional: boolean }>
> = ({ children, needLogin, loginOptional }) => (
  <>
    <LoginCheckMask needLogin={needLogin} loginOptional={loginOptional} />
    {children}
  </>
);
