import queryString from 'query-string';

import ConnectorApiService from './idl/connector_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const connectorApi = new ConnectorApiService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      paramsSerializer: p => queryString.stringify(p, { arrayFormat: 'comma' }),
      ...params,
      ...config,
    }),
});
