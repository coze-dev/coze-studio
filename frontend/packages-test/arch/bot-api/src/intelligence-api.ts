import IntelligenceApiService from './idl/intelligence_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const intelligenceApi = new IntelligenceApiService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      ...params,
      ...config,
      headers: { ...params.headers, ...config.headers, 'Agw-Js-Conv': 'str' },
    }),
});
