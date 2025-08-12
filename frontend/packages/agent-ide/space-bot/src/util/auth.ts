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

import { isEmpty } from 'lodash-es';
import { useRequest } from 'ahooks';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { type AuthLoginInfo } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';
import { connector2Redirect } from '@coze-foundation/account-adapter';
import { Toast } from '@coze-arch/coze-design';

export const useRevokeAuth = ({
  id,
  onRevokeSuccess,
  onRevokeFinally,
}: {
  id: string;
  onRevokeSuccess?: (id: string) => void;
  onRevokeFinally?: () => void;
}) => {
  const { loading, runAsync } = useRequest(
    async () =>
      await DeveloperApi.CancelUserAuth({
        connector_id: id,
      }),
    {
      manual: true,
      onSuccess: () => {
        onRevokeSuccess?.(id);
      },
      onFinally: () => {
        onRevokeFinally?.();
      },
    },
  );

  return {
    revokeLoading: loading,
    runRevoke: runAsync,
  };
};

export const executeAuthRedirect = async ({
  id,
  authInfo,
  origin,
}: {
  id: string;
  authInfo: AuthLoginInfo;
  origin?: 'setting' | 'publish';
}) => {
  const resp = await DeveloperApi.GetConnectorAuthState({
    connector_id: id,
  });
  const state = resp?.data?.state ?? {};
  connector2Redirect(
    {
      navigatePath: location.pathname,
      type: 'oauth',
      extra: {
        origin,
        ...state,
      },
    },
    id,
    authInfo,
  );
};

export const checkAuthInfoValid = (authInfo?: AuthLoginInfo) =>
  !isEmpty(authInfo) && !!authInfo?.authorize_url;

export const logAndToastAuthInfoError = () => {
  logger.error({
    message: 'connection_missing_oauth_info',
    error: new CustomError(
      'normal_error',
      'Connection missing oauth information',
    ),
  });
  Toast.error({
    content: withSlardarIdButton(I18n.t('error')),
  });
};
