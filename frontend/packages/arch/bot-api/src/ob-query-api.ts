import ObQueryApiService from './idl/ob_query_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const obQueryApi = new ObQueryApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    const headers = {
      'Agw-Js-Conv': 'str',
    };
    return axiosInstance.request({ ...params, ...config, headers });
  },
});
