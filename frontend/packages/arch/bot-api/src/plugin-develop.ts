import PluginDevelopApiService from './idl/plugin_develop';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PluginDevelopApi =
  new PluginDevelopApiService<BotAPIRequestConfig>({
    request: (params, config = {}) => {
      config.headers = Object.assign(config.headers || {}, {
        'Agw-Js-Conv': 'str',
      });

      return axiosInstance.request({ ...params, ...config });
    },
  });
