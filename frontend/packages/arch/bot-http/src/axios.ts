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

    // 新增接口返回message字段
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
        // 401 身份过期&没有身份
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
    // 新的 csrf 防护需要 post/get 请求全部带上这个 header
    setHeader('content-type', 'application/json');
    if (!config.data) {
      // axios 会自动在 data 为空时清除 content-type，所以需要设置一个空对象
      config.data = {};
    }
  }
  return config;
});

type AddRequestInterceptorShape = typeof axiosInstance.interceptors.request.use;
/**
 * 添加全局 axios 的 interceptor 处理器，方便在上层扩展 axios 行为。
 * 请注意，该接口会影响所有 bot-http 下的请求，请注意保证行为的稳定性
 */
export const addGlobalRequestInterceptor: AddRequestInterceptorShape = (
  onFulfilled,
  onRejected?,
) => {
  // PS: 这里不期望直接暴露 axios 实例到上层，因为不知道会被怎么修改使用
  // 因此，这里需要暴露若干方法，将行为与副作用限制在可控范围内
  const id = axiosInstance.interceptors.request.use(onFulfilled, onRejected);
  return id;
};

type RemoveRequestInterceptorShape =
  typeof axiosInstance.interceptors.request.eject;
/**
 * 删除全局 axios 的 interceptor 处理器，其中，id 参数为调用 addGlobalRequestInterceptor 返回的值
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
