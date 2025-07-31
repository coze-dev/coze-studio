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

// Rendering error states when needed & loading
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

export const RequireAuthContainer: FC<
  PropsWithChildren<{ needLogin: boolean; loginOptional: boolean }>
> = ({ children, needLogin, loginOptional }) => (
  <>
    <LoginCheckMask needLogin={needLogin} loginOptional={loginOptional} />
    {children}
  </>
);
