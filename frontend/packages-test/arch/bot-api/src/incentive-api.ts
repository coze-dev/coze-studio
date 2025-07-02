import IncentiveService from './idl/incentive';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const incentiveApi = new IncentiveService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      ...params,
      ...config,
      headers: { ...params.headers, ...config.headers, ['Agw-Js-Conv']: 'str' },
    }),
});
