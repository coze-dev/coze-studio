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

import { isAxiosError } from 'axios';
import { logger, reporter } from '@coze-arch/logger';
import { isApiError } from '@coze-arch/bot-http';

import { isChunkError } from './source-error';
import { isCustomError, type CustomError } from './custom-error';
import { ReportEventNames, type CertainErrorName } from './const';
const loggerWithScope = logger.createLoggerWith({
  ctx: {
    namespace: 'bot-error',
    scope: 'certain-error',
  },
});
const notInstanceError = (error: Error) => !(error instanceof Error);

const errorList: { func: (error: Error) => boolean; name: CertainErrorName }[] =
  [
    {
      func: isCustomError,
      name: 'CustomError',
    },
    {
      func: isAxiosError,
      name: 'AxiosError',
    },
    {
      func: isApiError,
      name: 'ApiError',
    },
    {
      func: isChunkError,
      name: 'ChunkLoadError',
    },
    {
      func: notInstanceError,
      name: 'notInstanceError',
    },
  ];

const handleCertainError: (error: Error) => void = error => {
  const errorName = getErrorName(error);

  loggerWithScope.info({
    message: 'handleCertainError',
    meta: {
      errorName,
      error,
    },
  });

  if (errorName === 'unknown') {
    return;
  }

  // Report a custom error
  if (errorName === 'CustomError') {
    const { eventName, msg } = error as CustomError;
    // Supplement unified reporting custom error event_name for monitoring
    loggerWithScope.persist.error({
      eventName: ReportEventNames.CustomErrorReport,
      message: msg,
      error,
      meta: {
        name: error.name,
        originEventName: eventName, // originEventName
        originErrorMessage: msg, // Original error msg
      },
    });
    loggerWithScope.persist.error({
      eventName,
      message: msg,
      error,
      meta: {
        name: error.name,
      },
    });
    return;
  }

  // Filter out custom events that have been reported
  if (errorName === 'ApiError' || errorName === 'AxiosError') {
    return;
  }

  // ChunkLoad failed, not reported, static resource exception statistics in slardar
  if (errorName === 'ChunkLoadError') {
    reporter.info({
      message: 'chunkLoadError',
      meta: {
        error,
        errorName: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
    return;
  }

  // Error that does not inherit Error, current case (semi form validation)
  if (errorName === 'notInstanceError') {
    let errorInfo;
    try {
      errorInfo =
        typeof error === 'object' ? JSON.stringify(error) : String(error);
    } catch (e) {
      errorInfo = 'notInstanceError json is invalid';
    }
    loggerWithScope.persist.error({
      eventName: ReportEventNames.NotInstanceError,
      message: errorInfo,
      error,
      meta: {
        name: 'notInstanceError',
        errorInfo,
      },
    });
    return;
  }
};
export const getErrorName = (error: Error) => {
  if (!error) {
    return 'unknown';
  }
  const result = errorList.find(({ func }) => func(error));
  if (result && result.name) {
    return result.name;
  }
  return 'unknown';
};

export const isCertainError = (error: Error) => {
  const errorName = getErrorName(error);
  return errorName !== 'unknown';
};
export const sendCertainError = (
  error: Error,
  handle?: (reason: string) => void,
) => {
  if (isCertainError(error)) {
    handleCertainError(error);
    return;
  }

  handle?.(error?.message);
};
