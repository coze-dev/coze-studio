import HubApiService from './idl/hub_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const hubApi = new HubApiService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      ...params,
      ...config,
      headers: { ...params.headers, ...config.headers, 'Agw-Js-Conv': 'str' },
    }),
});
