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

import axios, { type AxiosResponse, isAxiosError } from 'axios';
import { redirect } from '@coze-arch/web-context';
import { logger } from '@coze-arch/logger';

import { emitAPIErrorEvent, APIErrorEvent } from './eventbus';
import { ApiError, reportHttpError, ReportEventNames } from './api-error';

interface UnauthorizedResponse {
  data: {
    redirect_uri: string;
  };
  code: number;
  msg: string;
}

export enum ErrorCodes {
  NOT_LOGIN = 700012006,
  COUNTRY_RESTRICTED = 700012015,
  COZE_TOKEN_INSUFFICIENT = 702082020,
  COZE_TOKEN_INSUFFICIENT_WORKFLOW = 702095072,
}

export const axiosInstance = axios.create();

const HTTP_STATUS_COE_UNAUTHORIZED = 401;

type ResponseInterceptorOnFulfilled = (res: AxiosResponse) => AxiosResponse;
const customInterceptors = {
  response: new Set<ResponseInterceptorOnFulfilled>(),
};

axiosInstance.interceptors.response.use(
  response => {
    logger.info({
      namespace: 'api',
      scope: 'response',
      message: '----',
      meta: { response },
    });
    const { data = {} } = response;

    // Added interface return message field
    const { code, msg, message } = data;

    if (code !== 0) {
      const apiError = new ApiError(String(code), message ?? msg, response);

      switch (code) {
        case ErrorCodes.NOT_LOGIN: {
          // @ts-expect-error type safe
          apiError.config.__disableErrorToast = true;
          emitAPIErrorEvent(APIErrorEvent.UNAUTHORIZED, apiError);
          break;
        }
        case ErrorCodes.COUNTRY_RESTRICTED: {
          // @ts-expect-error type safe
          apiError.config.__disableErrorToast = true;
          emitAPIErrorEvent(APIErrorEvent.COUNTRY_RESTRICTED, apiError);
          break;
        }
        case ErrorCodes.COZE_TOKEN_INSUFFICIENT: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          apiError.config.__disableErrorToast = true;
          emitAPIErrorEvent(APIErrorEvent.COZE_TOKEN_INSUFFICIENT, apiError);
          break;
        }
        case ErrorCodes.COZE_TOKEN_INSUFFICIENT_WORKFLOW: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          apiError.config.__disableErrorToast = true;
          emitAPIErrorEvent(APIErrorEvent.COZE_TOKEN_INSUFFICIENT, apiError);
          break;
        }
        default: {
          break;
        }
      }

      reportHttpError(ReportEventNames.ApiError, apiError);
      return Promise.reject(apiError);
    }
    let res = response;
    for (const interceptor of customInterceptors.response) {
      res = interceptor(res);
    }

    return res;
  },
  error => {
    if (isAxiosError(error)) {
      reportHttpError(ReportEventNames.NetworkError, error);
      if (error.response?.status === HTTP_STATUS_COE_UNAUTHORIZED) {
        // 401 Identity Expired & No Identity
        if (typeof error.response.data === 'object') {
          const unauthorizedData = error.response.data as UnauthorizedResponse;
          const redirectUri = unauthorizedData?.data?.redirect_uri;
          if (redirectUri) {
            redirect(redirectUri);
          }
        }
      }
    }

    return Promise.reject(error);
  },
);

axiosInstance.interceptors.request.use(config => {
  const setHeader = (key: string, value: string) => {
    if (typeof config.headers.set === 'function') {
      config.headers.set(key, value);
    } else {
      config.headers[key] = value;
    }
  };
  const getHeader = (key: string) => {
    if (typeof config.headers.get === 'function') {
      return config.headers.get(key);
    }
    return config.headers[key];
  };
  setHeader('x-requested-with', 'XMLHttpRequest');
  if (
    ['post', 'get'].includes(config.method?.toLowerCase() ?? '') &&
    !getHeader('content-type')
  ) {
    // The new CSRF protection requires all post/get requests to have this header.
    setHeader('content-type', 'application/json');
    if (!config.data) {
      // Axios will automatically clear the content-type when the data is empty, so you need to set an empty object
      config.data = {};
    }
  }
  return config;
});

type AddRequestInterceptorShape = typeof axiosInstance.interceptors.request.use;
/**
 * Add an interceptor handler for global axios to easily extend axios behavior on top.
 * Please note that this interface will affect all requests under bot-http. Please ensure the stability of the behavior
 */
export const addGlobalRequestInterceptor: AddRequestInterceptorShape = (
  onFulfilled,
  onRejected?,
) => {
  // PS: It is not expected to directly expose the axios instance to the upper layer, because it is not known how it will be modified and used
  // Therefore, several methods need to be exposed to keep behavior and side effects under control
  const id = axiosInstance.interceptors.request.use(onFulfilled, onRejected);
  return id;
};

type RemoveRequestInterceptorShape =
  typeof axiosInstance.interceptors.request.eject;
/**
 * Removes the interceptor handler of the global axios where the id parameter is the value returned by the calling addGlobalRequestInterceptor
 */
export const removeGlobalRequestInterceptor: RemoveRequestInterceptorShape = (
  id: number,
) => {
  axiosInstance.interceptors.request.eject(id);
};

export const addGlobalResponseInterceptor = (
  onFulfilled: ResponseInterceptorOnFulfilled,
) => {
  customInterceptors.response.add(onFulfilled);
  return () => {
    customInterceptors.response.delete(onFulfilled);
  };
};
