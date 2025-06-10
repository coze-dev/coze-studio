import BenefitApiService from './idl/benefit';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const benefitApi = new BenefitApiService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      ...params,
      ...config,
      headers: { ...params.headers, ...config.headers, ['Agw-Js-Conv']: 'str' },
    }),
});
