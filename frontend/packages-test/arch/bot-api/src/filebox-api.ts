import FileboxService from './idl/filebox';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const fileboxApi = new FileboxService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    const { headers } = config;
    const reqHeaders = {
      ...headers,
      'Agw-Js-Conv': 'str',
    };
    return axiosInstance.request({ ...params, ...config, headers: reqHeaders });
  },
});

export { ObjType } from './idl/filebox';
