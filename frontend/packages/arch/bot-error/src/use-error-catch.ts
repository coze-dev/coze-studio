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

import { useEffect } from 'react';

import { logger, type SlardarInstance } from '@coze-arch/logger';

import { ReportEventNames } from './const';
import {
  sendCertainError,
  isCertainError,
  getErrorName,
} from './certain-error';

const loggerWithScope = logger.createLoggerWith({
  ctx: {
    namespace: 'bot-error',
    scope: 'use-error-catch',
  },
});

export const useErrorCatch = (slardarInstance: SlardarInstance) => {
  // 1. promise rejection
  useEffect(() => {
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      event.promise.catch(error => {
        loggerWithScope.info({
          message: 'handlePromiseRejection',
          meta: {
            error,
          },
        });
        sendCertainError(error, reason => {
          loggerWithScope.persist.error({
            eventName: ReportEventNames.Unhandledrejection,
            message: reason || 'unhandledrejection',
            error,
            meta: {
              reportJsError: true,
            },
          });
        });
      });
    };
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

  // 3. Interception of slardar reports
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const beforeSlardarSend = (e: any) => {
      const error = e?.payload?.error;
      if (
        error &&
        isCertainError(error) &&
        getErrorName(error) !== 'notInstanceError'
      ) {
        sendCertainError(error);
        return false;
      }
      return e;
    };
    slardarInstance?.on('beforeSend', beforeSlardarSend);
    return () => {
      slardarInstance?.off('beforeSend', beforeSlardarSend);
    };
  }, []);
};
