import PermissionOAuth2Service from './idl/permission_oauth2';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const permissionOAuth2Api =
  new PermissionOAuth2Service<BotAPIRequestConfig>({
    request: (params, config = {}) =>
      axiosInstance.request({ ...params, ...config }),
  });
