import CozeSpaceApiService from '@coze-arch/idl/stone_coze_space';

import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const cozeSpaceApi = new CozeSpaceApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    const reqHeaders = {
      ...config.headers,
      ...params.headers,
      'Agw-Js-Conv': 'str',
    };
    return axiosInstance.request({ ...params, ...config, headers: reqHeaders });
  },
});
