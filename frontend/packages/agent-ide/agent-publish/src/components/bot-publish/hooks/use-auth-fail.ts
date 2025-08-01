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

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { AuthStatus } from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';
import { UIModal } from '@coze-arch/bot-semi';
import { useResetLocationState } from '@coze-arch/bot-hooks';

// Tripartite authorization failed, callback to the release page needs to explicitly block the pop-up window
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
