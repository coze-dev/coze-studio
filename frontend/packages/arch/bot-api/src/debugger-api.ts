import DebuggerApiService from './idl/debugger_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const debuggerApi = new DebuggerApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    const { headers } = config;
    const reqHeaders = {
      ...headers,
      'Agw-Js-Conv': 'str',
    };
    return axiosInstance.request({ ...params, ...config, headers: reqHeaders });
  },
});
