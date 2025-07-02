import { AxiosError, type AxiosResponse } from 'axios';

export class ApiError extends AxiosError {
  public raw?: unknown;
  type: string;

  logId: string;

  constructor(
    public code: string,
    public msg: string | undefined,
    response: AxiosResponse,
  ) {
    super(msg, code, response.config, response.request, response);
    this.name = 'ApiError';
    this.type = 'Api Response Error';
    this.raw = response.data;
    this.logId = response.headers?.['x-tt-logid'];
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;
