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
import { useResetLocationState } from '@coze-arch/bot-hooks';

// The three-party authorization is successful, and the callback is successful.
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
