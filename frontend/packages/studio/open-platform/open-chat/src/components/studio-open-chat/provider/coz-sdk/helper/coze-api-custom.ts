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

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { CozeAPI, type ClientOptions } from '@coze/api';

import { isAuthError } from '@/util/error';

type OnRefreshToken = (oldToken?: string) => Promise<string> | string;

export class CozeApiCustom extends CozeAPI {
  private onRefreshToken?: OnRefreshToken;
  private refreshTokenPromise?: Promise<string> | string;
  constructor({
    onRefreshToken,
    axiosOptions,
    ...config
  }: ClientOptions & {
    onRefreshToken?: OnRefreshToken;
  }) {
    super({
      ...config,
      axiosOptions: {
        ...(axiosOptions || {}),
        timeout: 10 * 60 * 1000,
        validateStatus: () => true,
      },
    });
    this.onRefreshToken = onRefreshToken;
    this.axiosInstance = axios.create();
    this.useAuthError();
  }
  setRefreshToken(onRefreshToken?: OnRefreshToken) {
    this.onRefreshToken = onRefreshToken;
  }
  useAuthError() {
    const authInterceptor = async response => {
      const { code } = response?.data || {};
      if (isAuthError(code || response.status)) {
        // 由于 鉴权问题导致的失败，进行一次重新发送数据。
        const oldToken = this.getTokenFromHeaderAuth(
          String(response.config.headers.getAuthorization() || ''),
        );
        const token = await this.refreshToken(oldToken);
        if (token) {
          const config = { ...response.config };
          config.headers = { ...response.config.headers };
          response.config.headers.Authorization = `Bearer ${token}`;
          return await axios.request(response.config);
        }
      }
      return response;
    };
    this.useResponseInterceptors(authInterceptor, authInterceptor);
  }
  getTokenFromHeaderAuth(authorization: string) {
    return authorization.replace(/^\s*Bearer\s*/, '').replace(/\s+$/, '');
  }
  async refreshToken(oldToken: string): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }
    if (oldToken !== this.token) {
      // 同时并发的接口已经获取过token，直接返回
      return this.token as string;
    }
    this.refreshTokenPromise = this.onRefreshToken?.(this.token);
    const token = await this.refreshTokenPromise;
    this.refreshTokenPromise = undefined;
    this.token = token || '';
    return this.token;
  }
  useResponseInterceptors(
    responseInterceptor:
      | ((response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>)
      | undefined,
    rejectResponseInterceptor:
      | ((response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>)
      | undefined,
  ) {
    this.getAxiosInstance().interceptors.response.use(
      responseInterceptor,
      rejectResponseInterceptor,
    );
  }
  getAxiosInstance() {
    return this.axiosInstance as AxiosInstance;
  }
}
