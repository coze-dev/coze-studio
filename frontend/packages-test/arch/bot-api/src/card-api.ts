import CardApiService from './idl/card';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const cardApi = new CardApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    const reqHeaders = {
      ...config.headers,
      ...params.headers,
      'Agw-Js-Conv': 'str',
    };
    return axiosInstance.request({ ...params, ...config, headers: reqHeaders });
  },
});
