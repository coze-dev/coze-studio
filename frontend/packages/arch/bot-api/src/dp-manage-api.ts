import DpManageService from './idl/dp_manage';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const dpManageApi = new DpManageService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    config.headers = Object.assign(config.headers || {}, {
      'Agw-Js-Conv': 'str',
    });
    return axiosInstance.request({ ...params, ...config });
  },
});
