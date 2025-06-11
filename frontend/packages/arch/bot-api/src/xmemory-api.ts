import XmemoryApiService from './idl/xmemory_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const xMemoryApi = new XmemoryApiService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({ ...params, ...config }),
});
