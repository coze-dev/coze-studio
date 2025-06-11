import DeveloperBackendApiService from './idl/developer_backend';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const developerBackendApi =
  new DeveloperBackendApiService<BotAPIRequestConfig>({
    request: (params, config = {}) =>
      axiosInstance.request({ ...params, ...config }),
  });
