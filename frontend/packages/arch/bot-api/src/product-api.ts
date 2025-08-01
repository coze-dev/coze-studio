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

import qs from 'query-string';

import ProductApiService from './idl/product_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ProductApi = new ProductApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    config.paramsSerializer =
      config.paramsSerializer ||
      (p => qs.stringify(p, { arrayFormat: 'comma' }));
    config.headers = Object.assign(config.headers || {}, {
      'Agw-Js-Conv': 'str',
    });

    return axiosInstance.request({ ...params, ...config });
  },
});
