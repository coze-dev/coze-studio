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
    // TODO: fix this typo error @kaizhan
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const beforeSlardarSend = (e: any) => {
      const error = e?.payload?.error;
      // slardar 监听了同步错误，已知错误不上报到 jserror slardar中payload?.error 不是Error实例
      if (
        error &&
        isCertainError(error) &&
        getErrorName(error) !== 'notInstanceError'
      ) {
        sendCertainError(error);
        return false;
      }
      // 这里的 return e 是必要的，不然 Slardar 将不会上报任何数据
      return e;
    };
    slardarInstance?.on('beforeSend', beforeSlardarSend);
    return () => {
      slardarInstance?.off('beforeSend', beforeSlardarSend);
    };
  }, []);
};
