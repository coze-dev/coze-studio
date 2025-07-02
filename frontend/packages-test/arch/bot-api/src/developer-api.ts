import DeveloperApiService from './idl/developer_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const DeveloperApi = new DeveloperApiService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({ ...params, ...config }),
});
