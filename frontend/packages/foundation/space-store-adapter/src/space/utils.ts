import { reporter } from '@coze-arch/logger';
import { CustomError } from '@coze-arch/bot-error';

import { ReportEventNames } from './const';

const MAX_RETRY = 4;
const INTERVAL = 800;

interface PollingResponse<T = unknown> {
  data: T;
  isSuccess: boolean;
  tryCount: number;
}

export const polling = <T>({
  request,
  isValid,
  maxRetry = MAX_RETRY,
  interval = INTERVAL,
}: {
  request: () => Promise<T>;
  isValid: (data: T) => boolean;
  maxRetry?: number;
  interval?: number;
}): Promise<PollingResponse<T>> => {
  let tryCount = 0;
  return new Promise(resolve => {
    const go = async () => {
      const data = await request();
      if (!isValid(data)) {
        if (++tryCount < maxRetry) {
          setTimeout(go, interval);
        } else {
          resolve({
            data,
            isSuccess: false,
            tryCount,
          });
        }
      } else {
        resolve({
          data,
          isSuccess: true,
          tryCount,
        });
      }
    };
    go();
  });
};

export const reportSpaceListPollingRes = ({
  isSuccess,
  tryCount,
}: PollingResponse) => {
  reporter.errorEvent(
    isSuccess
      ? {
          eventName: ReportEventNames.PollingSpaceList,
          error: new CustomError(
            ReportEventNames.PollingSpaceList,
            tryCount.toString(),
          ),
        }
      : {
          eventName: ReportEventNames.EmptySpaceList,
          error: new CustomError(
            ReportEventNames.EmptySpaceList,
            'space list is empty',
          ),
        },
  );
};
