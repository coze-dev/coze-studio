import EvaluationLiteService from './idl/evaluation_lite';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const evaluationLiteApi = new EvaluationLiteService<BotAPIRequestConfig>(
  {
    request: (params, config = {}) => {
      const headers = {
        'Agw-Js-Conv': 'str',
      };
      return axiosInstance.request({ ...params, ...config, headers });
    },
  },
);
