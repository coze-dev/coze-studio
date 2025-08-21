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

import AopApiService from '@coze-arch/idl/aop_api';

import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const aopApi = new AopApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    params.data = {
      header: {
        version: '1.0.0',
        commType: '',
        transCode: params.url.split('/').pop(),
        srcIP: '',
        channelType: '',
        channelNo: '',
        srcSystemId: '',
        srcSystemDevId: '',
        charset: 'json',
        respFormat: 'UTF-8',
        reqNo: '',
        securityFlag: '',
        macCode: '',
        macValue: '',
        transTime: Date.now(),
        globalFlowNo: '',
      },
      body: params.data,
    };
    return axiosInstance.request({
      ...params,
      ...config,
      headers: {
        ...params.headers,
        ...config?.headers,
      },
    });
  },
});
