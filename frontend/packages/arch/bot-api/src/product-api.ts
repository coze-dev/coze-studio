import qs from 'query-string';

import ProductApiService from './idl/product_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ProductApi = new ProductApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    // 已和 liuxiong 确认所有 product 接口都已接入 agw，且 agw 只接受 comma pattern 的 array get 参数
    config.paramsSerializer =
      config.paramsSerializer ||
      (p => qs.stringify(p, { arrayFormat: 'comma' }));
    config.headers = Object.assign(config.headers || {}, {
      'Agw-Js-Conv': 'str',
    });

    return axiosInstance.request({ ...params, ...config });
  },
});
