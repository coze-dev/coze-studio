import MemoryService from './idl/memory';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

/* eslint-disable @typescript-eslint/naming-convention */
export const MemoryApi = new MemoryService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    const { headers } = config;
    const reqHeaders = {
      ...headers,
      'Agw-Js-Conv': 'str',
    };
    return axiosInstance.request({ ...params, ...config, headers: reqHeaders });
  },
});

export { SubLinkDiscoveryTaskStatus } from './idl/memory';
