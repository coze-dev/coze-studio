import WorkflowApiService from './idl/workflow_api';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const workflowApi = new WorkflowApiService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    config.headers = Object.assign(config.headers || {}, {
      'Agw-Js-Conv': 'str',
    });

    return axiosInstance.request({ ...params, ...config });
  },
});
