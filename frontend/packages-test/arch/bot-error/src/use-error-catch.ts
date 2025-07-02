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

  // 3. 拦截 slardar 上报
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
