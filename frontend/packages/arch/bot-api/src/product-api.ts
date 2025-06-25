import qs from 'query-string';

import ProductApiService from './idl/product_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ProductApi = new ProductApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    config.paramsSerializer =
      config.paramsSerializer ||
      (p => qs.stringify(p, { arrayFormat: 'comma' }));
    config.headers = Object.assign(config.headers || {}, {
      'Agw-Js-Conv': 'str',
    });

    return axiosInstance.request({ ...params, ...config });
  },
});
