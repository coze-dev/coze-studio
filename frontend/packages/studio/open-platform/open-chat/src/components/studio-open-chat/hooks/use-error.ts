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

import { useState } from 'react';

import { Toast } from '@coze-arch/bot-semi';

import { type SDKInitError } from '@/util/error';
import { catchParse } from '@/util';

type ErrorState = boolean | SDKInitError;
export type SetInitError = (error: ErrorState) => void;
export const useError = () => {
  const [initError, setError] = useState<ErrorState>(false);

  return {
    initError,
    setInitError: (error: ErrorState) => {
      if (!error) {
        setError(error);
      } else {
        if (initError && typeof initError !== 'boolean') {
          return;
        }
        setError(error);
      }
    },
    onMessageSendFail: (_params, _from, error) => {
      if (error instanceof Error) {
        const res = catchParse<{ code?: number; msg?: string }>(
          error.message,
          {},
        );

        if (res?.code && res?.msg) {
          Toast.error(res.msg);
        }
      }
    },
  };
};
