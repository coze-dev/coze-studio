import MultimediaService from './idl/multimedia_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const MultimediaApi = new MultimediaService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    config.headers = Object.assign(config.headers || {}, {
      'Agw-Js-Conv': 'str',
    });

    return axiosInstance.request({ ...params, ...config });
  },
});
