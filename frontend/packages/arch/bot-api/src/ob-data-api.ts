import ObDataService from './idl/ob_data';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const obDataApi = new ObDataService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      ...params,
      ...config,
      headers: { ...params.headers, ...config.headers, ['Agw-Js-Conv']: 'str' },
    }),
});
