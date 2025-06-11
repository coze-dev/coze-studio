import SocialApiService from './idl/social_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

// eslint-disable-next-line @typescript-eslint/naming-convention -- what can I say
export const SocialApi = new SocialApiService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      ...params,
      ...{
        ...config,
        headers: Object.assign(config.headers || {}, { 'Agw-Js-Conv': 'str' }),
      },
    }),
});
