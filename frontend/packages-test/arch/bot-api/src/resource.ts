import ResourceService from './idl/resource';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Resource = new ResourceService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({ ...params, ...config }),
});
