import MarketInteractionApiService from './idl/market_interaction_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const marketInteractionApi =
  new MarketInteractionApiService<BotAPIRequestConfig>({
    request: (params, config = {}) =>
      axiosInstance.request({
        ...params,
        ...config,
        headers: { ...params.headers, ...config.headers, 'Agw-Js-Conv': 'str' },
      }),
  });
