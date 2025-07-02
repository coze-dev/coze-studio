import BasicApiService from '@coze-arch/idl/basic_api';

import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const basicApi = new BasicApiService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      ...params,
      ...config,
      headers: { ...params.headers, ...config.headers, 'Agw-Js-Conv': 'str' },
    }),
});
