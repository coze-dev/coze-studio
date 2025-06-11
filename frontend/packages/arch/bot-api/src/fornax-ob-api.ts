import FornaxObApiService from '@coze-arch/idl/fornax_ob_api';

import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const fornaxObApi = new FornaxObApiService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      ...params,
      ...config,
      headers: { ...params.headers, ...config.headers, ['Agw-Js-Conv']: 'str' },
    }),
});
