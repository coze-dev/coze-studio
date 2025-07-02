import { AxiosError, type AxiosResponse } from 'axios';
import { logger } from '@coze-arch/logger';

// 上报事件枚举
export enum ReportEventNames {
  NetworkError = 'flow-infra-network-error',
  ApiError = 'flow-infra-api-error',
}
interface ApiErrorOptions {
  hasShowedError?: boolean;
}

export class ApiError extends AxiosError {
  hasShowedError: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public raw?: any;
  type: string;

  // eslint-disable-next-line max-params
  constructor(
    public code: string,
    public msg: string | undefined,
    response: AxiosResponse,
    options: ApiErrorOptions = {},
  ) {
    const { hasShowedError = false } = options;

    super(msg, code, response.config, response.request, response);
    this.name = 'ApiError';
    this.type = 'Api Response Error';
    this.hasShowedError = hasShowedError;
    this.raw = response.data;
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;

// 上报http错误，apiError&axiosError
export const reportHttpError = (
  eventName: ReportEventNames,
  error: AxiosError,
) => {
  try {
    const { response, config } = error;
    const {
      code = '',
      msg = '',
      message,
    } = response?.data as {
      code?: string;
      msg?: string;
      message?: string;
    };
    const { status: httpStatusCode, headers } = response || {};
    const { method: httpMethod, url: urlPath } = config || {};
    const logId = headers?.['x-tt-logid'];
    const customErrorCode = String(code);
    const customErrorMsg = message ?? msg;

    logger.persist.error({
      eventName,
      error,
      meta: {
        message: error.message,
        name: error.name,
        httpStatusCode: String(httpStatusCode),
        httpMethod,
        urlPath,
        logId,
        customErrorCode,
        customErrorMsg,
      },
    });
  } catch (e) {
    logger.persist.error({
      error: e as Error,
      message: error.message,
    });
  }
};
