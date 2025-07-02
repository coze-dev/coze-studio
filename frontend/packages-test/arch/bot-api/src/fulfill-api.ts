import FulfillApiService from './idl/fulfill';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const fulfillApi = new FulfillApiService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      ...params,
      ...config,
      headers: { ...params.headers, ...config.headers, ['Agw-Js-Conv']: 'str' },
    }),
});
