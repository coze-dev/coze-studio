import PermissionAuthzService from './idl/permission_authz';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const permissionAuthzApi =
  new PermissionAuthzService<BotAPIRequestConfig>({
    request: (params, config = {}) =>
      axiosInstance.request({ ...params, ...config }),
  });
