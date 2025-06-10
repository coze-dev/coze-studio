import TradeApiService from './idl/trade';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const tradeApi = new TradeApiService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      ...params,
      ...config,
      headers: { ...params.headers, ...config.headers, ['Agw-Js-Conv']: 'str' },
    }),
});
