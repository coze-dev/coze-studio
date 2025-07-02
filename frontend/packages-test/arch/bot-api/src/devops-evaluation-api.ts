import DevopsEvaluationService from './idl/devops_evaluation';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const devopsEvaluationApi =
  new DevopsEvaluationService<BotAPIRequestConfig>({
    request: (params, config = {}) => {
      const reqHeaders = {
        ...config.headers,
        ...params.headers,
        'Agw-Js-Conv': 'str',
      };
      return axiosInstance.request({
        ...params,
        ...config,
        headers: reqHeaders,
      });
    },
  });
