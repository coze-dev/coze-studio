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
  response => response.data,
  error => {
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
