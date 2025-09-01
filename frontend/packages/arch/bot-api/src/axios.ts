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

import { Toast } from '@coze-arch/bot-semi';
import {
  axiosInstance,
  isApiError,
  type AxiosRequestConfig,
} from '@coze-arch/bot-http';

// Toast display 80px from the top
Toast.config({
  top: 80,
});

interface CustomAxiosConfig {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __disableErrorToast?: boolean;
}

/**
 * Business custom axios configuration
 * @param __disableErrorToast default: false
 */
export type BotAPIRequestConfig = AxiosRequestConfig & CustomAxiosConfig;

axiosInstance.interceptors.response.use(
  (response: any) => {
    // 处理上传相关接口的端口号问题
    if (response.config.url?.includes('/upload/auth_token') && response.data?.data?.upload_host) {
      const uploadHost = response.data.data.upload_host;
      const portMatch = uploadHost.match(/^([^:\/]+)(:\d+)(\/.*)?$/);
      if (portMatch) {
        const hostPart = portMatch[1];
        const pathPart = portMatch[3] || ''; // /api/common/upload
        
        // 判断是否为需要去掉端口号的域名
        // 条件：包含字母 且 不是IP地址 且 不是localhost
        const isDomain = /[a-zA-Z]/.test(hostPart) && 
                        !/^\d+\.\d+\.\d+\.\d+$/.test(hostPart) && 
                        hostPart !== 'localhost';
        
        if (isDomain) {
          // 域名：去掉端口号
          // 例如：agents.finmall.com:8888/api/common/upload -> agents.finmall.com/api/common/upload
          response.data.data.upload_host = hostPart + pathPart;
        }
        // IP地址：保持原样，不做任何修改
        // 例如：10.10.10.220:8888/api/common/upload 保持不变
      }
    }
    return response.data;
  },
  (error: any) => {
    // business logic
    if (
      isApiError(error) &&
      error.msg &&
      !(error.config as CustomAxiosConfig).__disableErrorToast
    ) {
      Toast.error({
        content: error.msg,
        showClose: false,
      });
    }

    throw error;
  },
);

export { axiosInstance };
