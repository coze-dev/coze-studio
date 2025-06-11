import PlaygroundApiService from './idl/playground_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PlaygroundApi = new PlaygroundApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    config.headers = Object.assign(config.headers || {}, {
      'Agw-Js-Conv': 'str',
    });

    return axiosInstance.request({ ...params, ...config });
  },
});
