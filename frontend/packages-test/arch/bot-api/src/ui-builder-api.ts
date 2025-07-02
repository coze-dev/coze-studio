import UiBuilderApiService from './idl/ui-builder';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const uiBuilderApi = new UiBuilderApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    const reqHeaders = {
      ...config.headers,
      ...params.headers,
      'Agw-Js-Conv': 'str',
    };
    return axiosInstance.request({ ...params, ...config, headers: reqHeaders });
  },
});
