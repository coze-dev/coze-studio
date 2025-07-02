import AppBuilderApiService from './idl/app_builder';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const appBuilderApi = new AppBuilderApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    const reqHeaders = {
      ...config.headers,
      ...params.headers,
      'Agw-Js-Conv': 'str',
    };
    return axiosInstance.request({ ...params, ...config, headers: reqHeaders });
  },
});
