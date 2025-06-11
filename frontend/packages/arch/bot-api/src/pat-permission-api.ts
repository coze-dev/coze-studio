import PATPermissionService from './idl/pat_permission_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const patPermissionApi = new PATPermissionService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({ ...params, ...config }),
});
